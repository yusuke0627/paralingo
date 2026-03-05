import { VocabRepository } from "../../application/ports/VocabRepository";
import { VocabMemo } from "../../domain/entities";

export class InMemoryVocabRepository implements VocabRepository {
  private memos: VocabMemo[] = [];

  async save(memo: VocabMemo): Promise<void> {
    const existingIndex = this.memos.findIndex(m => m.term === memo.term);
    if (existingIndex >= 0) {
      this.memos[existingIndex] = {
        ...this.memos[existingIndex],
        translation: [...new Set([...this.memos[existingIndex].translation, ...memo.translation])],
        content: [...new Set([...this.memos[existingIndex].content, ...memo.content])]
      };
    } else {
      this.memos.push({
        ...memo,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      });
    }
  }

  async list(): Promise<VocabMemo[]> {
    return this.memos;
  }

  async findById(id: string): Promise<VocabMemo | null> {
    return this.memos.find(m => m.id === id) || null;
  }

  async findByTerm(term: string): Promise<VocabMemo | null> {
    return this.memos.find(m => m.term === term) || null;
  }
}
