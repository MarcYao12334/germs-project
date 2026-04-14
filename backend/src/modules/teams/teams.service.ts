import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitterService } from '../../websocket/event-emitter.service';

@Injectable()
export class TeamsService {
  private logger = new Logger('TeamsService');

  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitterService,
  ) {}

  async findAll(country?: string) {
    let query = 'SELECT * FROM equipes WHERE actif = true';
    const params: any[] = [];
    if (country) { params.push(country); query += ` AND pays = $${params.length}`; }
    query += ' ORDER BY nom';
    return this.dataSource.query(query, params);
  }

  async findOne(id: string) {
    const result = await this.dataSource.query(
      `SELECT e.*, json_agg(json_build_object('id', p.id, 'nom', u.nom, 'prenoms', u.prenoms, 'grade', p.grade, 'role', p.role_equipe)) as membres
       FROM equipes e LEFT JOIN pompiers p ON p.equipe_id = e.id LEFT JOIN utilisateurs u ON u.id = p.utilisateur_id
       WHERE e.id = $1 GROUP BY e.id`, [id]);
    if (result.length === 0) throw new NotFoundException();
    return result[0];
  }

  async create(data: any) {
    const codeEquipe = `EQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const result = await this.dataSource.query(
      `INSERT INTO equipes (nom, unite, type_vehicule, immatriculation, telephone, code_equipe, pays, langue_pref, timezone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.nom, data.unite, data.type_vehicule, data.immatriculation, data.telephone, codeEquipe, data.pays || 'FR', data.langue_pref || 'fr', data.timezone || 'Europe/Paris'],
    );
    return result[0];
  }

  async updatePosition(teamId: string, position: { lat: number; lng: number; accuracy?: number }) {
    await this.dataSource.query(
      `INSERT INTO positions_equipes (equipe_id, geom, accuracy) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)`,
      [teamId, position.lng, position.lat, position.accuracy || 0],
    );
    this.eventEmitter.emitGlobal('position:updated', { teamId, ...position, timestamp: new Date() });
    return { updated: true };
  }

  async rateTeam(teamId: string, data: { interventionId: string; citizenId: string; note: number; commentaire?: string }) {
    await this.dataSource.query(
      `INSERT INTO notes_equipes (intervention_id, equipe_id, utilisateur_citoyen_id, note, commentaire)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.interventionId, teamId, data.citizenId, data.note, data.commentaire],
    );
    // Update average rating
    await this.dataSource.query(
      `UPDATE equipes SET note_moyenne = (SELECT AVG(note) FROM notes_equipes WHERE equipe_id = $1) WHERE id = $1`,
      [teamId],
    );
    return { rated: true };
  }
}
