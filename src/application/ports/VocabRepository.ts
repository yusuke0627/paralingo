import { VocabMemo } from "../../domain/entities";

export interface VocabRepository {
  save(memo: VocabMemo): Promise<void>;
  list(): Promise<VocabMemo[]>;
  findById(id: string): Promise<VocabMemo | null>;
  findByTerm(term: string): Promise<VocabMemo | null>;
}
