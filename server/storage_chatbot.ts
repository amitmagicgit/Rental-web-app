import { Pool } from "pg";

/*
  WhatsApp‑only storage helper for the chatbot lambda.
  Telegram data lives elsewhere; this file isolates everything that
  touches the `whatsapp_subscriptions` and `whatsapp_message_log` tables.
*/

export interface WhatsappSubscription {
  phone_number: string;
  min_price: number | null;
  max_price: number | null;
  min_size: number | null;
  max_size: number | null;
  neighborhoods: string[] | null;
  min_rooms: number | null;
  max_rooms: number | null;
  balcony: string[] | null;
  agent: string[] | null;
  parking: string[] | null;
  furnished: string[] | null;
  include_zero_price: boolean;
  include_zero_size: boolean;
  include_zero_rooms: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface WhatsappMessageLog {
  phone_number: string;
  post_id?: string;
  sent_at?: Date;
}

export class ChatbotStorage {
  constructor(private pool: Pool) {}

  /* ------------------------------------------------------------------ */
  /* WhatsApp subscriptions                                             */
  /* ------------------------------------------------------------------ */

  async getWhatsappSubscriptionByPhone(
    phone: string,
  ): Promise<WhatsappSubscription | undefined> {
    const { rows } = await this.pool.query(
      "SELECT * FROM whatsapp_subscriptions WHERE phone_number = $1",
      [phone],
    );
    return rows[0];
  }

  async upsertWhatsappSubscription(
    sub: WhatsappSubscription,
  ): Promise<WhatsappSubscription> {
    const { rows } = await this.pool.query(
      `
      INSERT INTO whatsapp_subscriptions (
        phone_number, min_price, max_price, min_size, max_size,
        neighborhoods, min_rooms, max_rooms,
        balcony, agent, parking, furnished,
        include_zero_price, include_zero_size, include_zero_rooms
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,
        $14,$15
      )
      ON CONFLICT (phone_number) DO UPDATE SET
        min_price  = EXCLUDED.min_price,
        max_price  = EXCLUDED.max_price,
        min_size   = EXCLUDED.min_size,
        max_size   = EXCLUDED.max_size,
        neighborhoods = EXCLUDED.neighborhoods,
        min_rooms  = EXCLUDED.min_rooms,
        max_rooms  = EXCLUDED.max_rooms,
        balcony    = EXCLUDED.balcony,
        agent      = EXCLUDED.agent,
        parking    = EXCLUDED.parking,
        furnished  = EXCLUDED.furnished,
        include_zero_price = EXCLUDED.include_zero_price,
        include_zero_size  = EXCLUDED.include_zero_size,
        include_zero_rooms = EXCLUDED.include_zero_rooms,
        updated_at = NOW()
      RETURNING *;
      `,
      [
        sub.phone_number,
        sub.min_price,
        sub.max_price,
        sub.min_size,
        sub.max_size,
        sub.neighborhoods,
        sub.min_rooms,
        sub.max_rooms,
        sub.balcony,
        sub.agent,
        sub.parking,
        sub.furnished,
        sub.include_zero_price,
        sub.include_zero_size,
        sub.include_zero_rooms,
      ],
    );
    console.log(rows[0]);
    console.log(sub);
    return rows[0];
  }

  /* ------------------------------------------------------------------ */
  /* Message logging + simple stats                                     */
  /* ------------------------------------------------------------------ */

  async getDailySentWhatsappMessages(): Promise<
    Array<{ date_sent: string; daily_sent: number }>
  > {
    const { rows } = await this.pool.query(
      `SELECT sent_at::date AS date_sent, COUNT(*) AS daily_sent
       FROM whatsapp_message_log
       GROUP BY sent_at::date
       ORDER BY date_sent DESC`,
    );
    return rows;
  }
}
