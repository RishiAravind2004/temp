import { BlockchainBlock, QuizAttempt } from "../types";

export class Blockchain {
  private chain: BlockchainBlock[] = [];

  constructor() {
    // Create genesis block
    this.chain.push(this.createGenesisBlock());
  }

  private createGenesisBlock(): BlockchainBlock {
    return {
      index: 0,
      timestamp: new Date(),
      data: {} as QuizAttempt,
      previousHash: "0",
      hash: this.calculateHash(0, new Date(), {}, "0", 0),
      nonce: 0,
    };
  }

  getLatestBlock(): BlockchainBlock {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data: QuizAttempt): BlockchainBlock {
    const previousBlock = this.getLatestBlock();
    const newBlock: BlockchainBlock = {
      index: previousBlock.index + 1,
      timestamp: new Date(),
      data,
      previousHash: previousBlock.hash,
      hash: "",
      nonce: 0,
    };

    // Proof of work (simplified)
    newBlock.hash = this.mineBlock(newBlock);
    
    this.chain.push(newBlock);
    return newBlock;
  }

  private mineBlock(block: BlockchainBlock): string {
    let hash = "";
    let nonce = 0;
    const difficulty = 2; // Number of leading zeros required

    do {
      nonce++;
      hash = this.calculateHash(
        block.index,
        block.timestamp,
        block.data,
        block.previousHash,
        nonce
      );
    } while (!hash.startsWith("0".repeat(difficulty)));

    block.nonce = nonce;
    return hash;
  }

  private calculateHash(
    index: number,
    timestamp: Date,
    data: any,
    previousHash: string,
    nonce: number
  ): string {
    const str = `${index}${timestamp.toISOString()}${JSON.stringify(data)}${previousHash}${nonce}`;
    
    // Simple hash function (in production, use SHA-256)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify hash
      const recalculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }

      // Verify chain link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  getChain(): BlockchainBlock[] {
    return this.chain;
  }

  verifyResult(attemptId: string): {
    isValid: boolean;
    block?: BlockchainBlock;
    message: string;
  } {
    const block = this.chain.find((b) => b.data.id === attemptId);

    if (!block) {
      return {
        isValid: false,
        message: "Result not found in blockchain",
      };
    }

    const isValid = this.isChainValid();

    return {
      isValid,
      block,
      message: isValid
        ? "Result is verified and tamper-proof"
        : "Warning: Blockchain integrity compromised",
    };
  }
}

// Global blockchain instance
export const blockchainInstance = new Blockchain();
