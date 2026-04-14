import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitterService } from '../../websocket/event-emitter.service';

@Injectable()
export class InterventionsService {
  private logger = new Logger('InterventionsService');

  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitterService,
  ) {}

  async findAll(country?: string, status?: string) {
    let query = `SELECT i.*, e.nom as equipe_nom, e.unite as equipe_unite
                 FROM interventions i LEFT JOIN equipes e ON i.equipe_id = e.id WHERE 1=1`;
    const params: any[] = [];
    if (country) { params.push(country); query += ` AND i.pays = $${params.length}`; }
    if (status) { params.push(status); query += ` AND i.statut = $${params.length}`; }
    query += ' ORDER BY i.created_at DESC LIMIT 100';
    return this.dataSource.query(query, params);
  }

  async getStats(country?: string) {
    const countryFilter = country ? `WHERE pays = '${country}'` : '';
    const [active, pending, teams, avgTime, successRate] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*) as count FROM interventions ${countryFilter} ${countryFilter ? 'AND' : 'WHERE'} statut IN ('EN_ROUTE', 'SUR_PLACE')`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM alertes ${countryFilter} ${countryFilter ? 'AND' : 'WHERE'} statut = 'PENDING'`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM equipes ${countryFilter} ${countryFilter ? 'AND' : 'WHERE'} actif = true`),
      this.dataSource.query(`SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (fin_at - debut_at))/60), 0) as avg_minutes FROM interventions ${countryFilter} ${countryFilter ? 'AND' : 'WHERE'} fin_at IS NOT NULL`),
      this.dataSource.query(`SELECT CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(*) FILTER (WHERE statut = 'TERMINE')::decimal / COUNT(*) * 100, 1) ELSE 0 END as rate FROM interventions ${countryFilter}`),
    ]);
    return {
      interventions_actives: parseInt(active[0].count),
      alertes_en_attente: parseInt(pending[0].count),
      equipes_disponibles: parseInt(teams[0].count),
      temps_moyen_minutes: parseFloat(avgTime[0].avg_minutes),
      taux_reussite: parseFloat(successRate[0].rate),
    };
  }

  async findOne(id: string) {
    const result = await this.dataSource.query(
      `SELECT i.*, e.nom as equipe_nom, e.unite as equipe_unite
       FROM interventions i LEFT JOIN equipes e ON i.equipe_id = e.id WHERE i.id = $1`, [id]);
    if (result.length === 0) throw new NotFoundException();
    return result[0];
  }

  async createFromAlert(alertId: string, operatorId: string) {
    const alert = await this.dataSource.query('SELECT * FROM alertes WHERE id = $1', [alertId]);
    if (alert.length === 0) throw new NotFoundException('Alert not found');
    const a = alert[0];
    const code = `INT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const result = await this.dataSource.query(
      `INSERT INTO interventions (code, type_incident, source, alerte_principale_id, geom, adresse, operateur_id, pays, debut_at)
       VALUES ($1, $2, 'ALERTE', $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [code, a.type_incident, alertId, a.geom, a.adresse, operatorId, a.pays],
    );
    await this.dataSource.query(`UPDATE alertes SET statut = 'VALIDATED' WHERE id = $1`, [alertId]);
    const intervention = result[0];
    this.eventEmitter.emitToCountry(intervention.pays, 'intervention:created', intervention);
    this.eventEmitter.emitToUser(a.utilisateur_id, 'alert:accepted', { alertId, interventionId: intervention.id });
    this.logger.log(`Intervention created: ${code} from alert ${a.code}`);
    return intervention;
  }

  async updateStatus(id: string, newStatus: string, currentVersion: number) {
    const result = await this.dataSource.query(
      `UPDATE interventions SET statut = $1, updated_at = NOW()
       ${newStatus === 'SUR_PLACE' ? ', arrivee_at = NOW()' : ''}
       ${newStatus === 'TERMINE' ? ', fin_at = NOW()' : ''}
       WHERE id = $2 AND version = $3 RETURNING *`,
      [newStatus, id, currentVersion],
    );
    if (result[1] === 0) throw new ConflictException('Version conflict - please refresh');
    const intervention = result[0][0] || result[0];
    this.eventEmitter.emitToIntervention(id, 'intervention:status-changed', { interventionId: id, status: newStatus });
    this.eventEmitter.emitToCountry(intervention.pays, 'intervention:updated', intervention);
    return intervention;
  }

  async assignTeam(id: string, teamId: string) {
    const result = await this.dataSource.query(
      'UPDATE interventions SET equipe_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [teamId, id],
    );
    const intervention = result[0][0] || result[0];
    this.eventEmitter.emitToIntervention(id, 'intervention:team-assigned', { interventionId: id, teamId });
    return intervention;
  }

  async submitBilan(id: string, bilan: any) {
    const result = await this.dataSource.query(
      'UPDATE interventions SET bilan = $1, statut = $2, fin_at = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *',
      [JSON.stringify(bilan), 'TERMINE', id],
    );
    return result[0][0] || result[0];
  }
}
