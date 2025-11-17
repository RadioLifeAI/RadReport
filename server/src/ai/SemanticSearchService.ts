import { PoolClient } from 'pg'

export const SemanticSearchService = {
  async searchVectors(client: PoolClient, vector: number[], modality: string, k: number){
    const sql = `select entity, entity_id, text, embed_vector <=> $1 as distance
                 from embeddings_store where modality=$2 order by embed_vector <=> $1 asc limit $3`
    const r = await client.query(sql, [vector, modality, k])
    return r.rows as Array<{ entity: string, entity_id: string, text: string, distance: number }>
  },
  async searchText(client: PoolClient, q: string, modality: string, k: number){
    const r = await client.query(`select entity, entity_id, text, 0 as distance from embeddings_store where modality=$1 and text ilike '%'||$2||'%' limit $3`, [modality, q, k])
    return r.rows
  }
}