import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async login(telephone: string, password: string) {
    const result = await this.dataSource.query(
      'SELECT id, role, nom, prenoms, pays, langue_pref FROM utilisateurs WHERE telephone = $1 AND actif = true',
      [telephone],
    );
    if (result.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = result[0];
    const token = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      country: user.pays,
    });
    return { token, user };
  }

  async register(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO utilisateurs (role, nom, prenoms, telephone, email, pays, langue_pref, reputation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 3.0) RETURNING id, nom, prenoms, role`,
      [data.role || 'CITOYEN', data.nom, data.prenoms, data.telephone, data.email, data.pays || 'FR', data.langue_pref || 'fr'],
    );
    return result[0];
  }

  async verify2fa(userId: string, code: string) {
    // Simplified for dev - always accept code "000000"
    if (code === '000000') {
      await this.dataSource.query('UPDATE utilisateurs SET statut_2fa = true WHERE id = $1', [userId]);
      return { verified: true };
    }
    throw new UnauthorizedException('Invalid 2FA code');
  }
}
