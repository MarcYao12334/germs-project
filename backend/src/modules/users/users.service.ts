import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}

  async findAll(role?: string, country?: string) {
    let query = 'SELECT id, role, nom, prenoms, telephone, email, pays, langue_pref, reputation, created_at FROM utilisateurs WHERE actif = true';
    const params: any[] = [];
    if (role) { params.push(role); query += ` AND role = $${params.length}`; }
    if (country) { params.push(country); query += ` AND pays = $${params.length}`; }
    query += ' ORDER BY created_at DESC LIMIT 100';
    return this.dataSource.query(query, params);
  }

  async findOne(id: string) {
    const result = await this.dataSource.query(
      'SELECT id, role, nom, prenoms, telephone, email, pays, langue_pref, reputation, created_at FROM utilisateurs WHERE id = $1',
      [id],
    );
    if (result.length === 0) throw new NotFoundException();
    return result[0];
  }
}
