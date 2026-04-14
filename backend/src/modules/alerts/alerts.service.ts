import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitterService } from '../../websocket/event-emitter.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AlertsService {
  private logger = new Logger('AlertsService');

  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitterService,
  ) {}

  async findAll(country?: string, status?: string) {
    let query = 'SELECT * FROM alertes WHERE 1=1';
    const params: any[] = [];
    if (country) { params.push(country); query += ` AND pays = $${params.length}`; }
    if (status) { params.push(status); query += ` AND statut = $${params.length}`; }
    query += ' ORDER BY created_at DESC LIMIT 100';
    return this.dataSource.query(query, params);
  }

  async findOne(id: string) {
    const result = await this.dataSource.query('SELECT * FROM alertes WHERE id = $1', [id]);
    if (result.length === 0) throw new NotFoundException('Alert not found');
    return result[0];
  }

  async create(data: any) {
    const code = `ALT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const result = await this.dataSource.query(
      `INSERT INTO alertes (code, type_incident, description, geom, adresse, utilisateur_id, telephone_contact, pays, langue)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, $8, $9, $10) RETURNING *`,
      [code, data.type_incident, data.description, data.lng || 0, data.lat || 0, data.adresse, data.utilisateur_id, data.telephone_contact, data.pays || 'FR', data.langue || 'fr'],
    );
    const alert = result[0];
    this.eventEmitter.emitToCountry(alert.pays, 'alert:new', alert);
    this.logger.log(`Alert created: ${alert.code}`);
    return alert;
  }

  async validate(id: string, operatorId: string) {
    const result = await this.dataSource.query(
      `UPDATE alertes SET statut = 'VALIDATED', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    if (result[1] === 0) throw new NotFoundException('Alert not found');
    const alert = result[0][0] || result[0];
    this.eventEmitter.emitToCountry(alert.pays, 'alert:validated', alert);
    return alert;
  }

  async reject(id: string, motif: string) {
    const result = await this.dataSource.query(
      `UPDATE alertes SET statut = 'REJECTED', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    return result[0][0] || result[0];
  }
}
