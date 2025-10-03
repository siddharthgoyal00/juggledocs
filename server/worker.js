// import dotenv from "dotenv";
// dotenv.config();

// import { Worker } from "bullmq";
// import { QdrantVectorStore } from "@langchain/qdrant";
// import { Document } from "@langchain/core/documents";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { CharacterTextSplitter } from "@langchain/textsplitters";
// import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
// import { QdrantClient } from "@qdrant/js-client-rest";

// const HF_API_KEY = process.env.HF_API_KEY;

// if (!HF_API_KEY) {
//   throw new Error("HF_API_KEY is not set. Check your .env file in the server folder!");
// }

// const worker = new Worker(
//   "file-upload-queue",
//   async (job) => {
//     const data = JSON.parse(job.data);

//     // 1. Load PDF
//     const loader = new PDFLoader(data.path);
//     const docs = await loader.load();
//     console.log(docs)
//     // 2. Split into chunks
//     // const splitter = new CharacterTextSplitter({
//     //   chunkSize: 1000,
//     //   chunkOverlap: 100,
//     // });
//     // const splitDocs = await splitter.splitDocuments(docs);

//     // 3. Hugging Face embeddings
//     const embeddings = new HuggingFaceInferenceEmbeddings({
//       apiKey: HF_API_KEY,
//       model: "sentence-transformers/all-MiniLM-L6-v2",
//     });

//     // 4. Qdrant client
//     const client = new QdrantClient({ url: "http://localhost:6333" });

//     // 5. Store vectors
//     const vectorStore = await QdrantVectorStore.fromExistingCollection(
//       embeddings,
//       {
//         url:'http://localhost:6333',
//         collectionName: "pdf-collection",
//       }
//     );
//     await vectorStore.addDocuments(docs)
    

//     console.log("✅ PDF embedded and stored in Qdrant");
//   },
//   {
//     concurrency: 100,
//     connection: {
//       host: "localhost",
//       port: 6379, // number, not string
//     },
//   }
// );
import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantClient } from "@qdrant/js-client-rest";

const HF_API_KEY = process.env.HF_API_KEY;

if (!HF_API_KEY) {
  throw new Error("HF_API_KEY is not set. Check your .env file in the server folder!");
}

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      const data = JSON.parse(job.data);

      // 1. Load PDF
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();
      console.log("Loaded docs:", docs);

      // 2. Split into chunks
      const splitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
      });
      const splitDocs = await splitter.splitDocuments(docs);

      // 3. Hugging Face embeddings
      const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: HF_API_KEY,
        model: "sentence-transformers/all-MiniLM-L6-v2",
      });

      // 4. Qdrant client
      const client = new QdrantClient({ url: "http://localhost:6333" });

      // 5. Store vectors
      const vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        {
          client,
          collectionName: "pdf-collection",
        }
      );

      console.log("✅ PDF embedded and stored in Qdrant");
    } catch (err) {
      console.error("❌ Error processing job:", err);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
