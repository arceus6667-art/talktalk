import { 
  Document, 
  Workspace, 
  Collection, 
  Conversation, 
  ObservabilityLog, 
  User 
} from '../types';

export const CURRENT_USER: User = {
  id: 'usr-1',
  name: 'Arceus',
  email: 'arceus6667@gmail.com',
  role: 'researcher',
};

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Advanced Technical Research',
    slug: 'advanced-technical-research',
    description: 'Empirical quantum error correction, autonomous agent scaling, and cryogenic telemetry.',
    createdAt: '2026-03-01T10:00:00Z',
    documentCount: 4,
  },
  {
    id: 'ws-2',
    name: 'Autonomous Systems Lab',
    slug: 'autonomous-systems-lab',
    description: 'Multi-agent orchestration, verifiable citation grounding, and formal proof verification.',
    createdAt: '2026-03-10T14:30:00Z',
    documentCount: 2,
  },
];

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    workspaceId: 'ws-1',
    name: 'Quantum Computing & QEC',
    description: 'Surface codes, syndrome extraction latency, and cryogenic hardware thermal budgets.',
    color: '#6366F1', // Indigo
    documentCount: 2,
    createdAt: '2026-03-02T11:00:00Z',
  },
  {
    id: 'col-2',
    workspaceId: 'ws-1',
    name: 'Autonomous Agent Architectures',
    description: 'Hierarchical speculative execution, deterministic arbitration, and hallucination reduction.',
    color: '#8B5CF6', // Violet
    documentCount: 1,
    createdAt: '2026-03-05T09:15:00Z',
  },
  {
    id: 'col-3',
    workspaceId: 'ws-1',
    name: 'Solid-State Materials',
    description: 'Ceramic vs sulfide electrolyte interfaces, critical current densities, and dendrite suppression.',
    color: '#06B6D4', // Restrained Cyan
    documentCount: 1,
    createdAt: '2026-03-08T16:20:00Z',
  },
];

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    workspaceId: 'ws-1',
    filename: 'Topological_Surface_Code_Fault_Tolerance_v2.pdf',
    fileType: 'pdf',
    size: 3481600, // ~3.4 MB
    uploadTimestamp: '2026-03-12T14:20:00Z',
    status: 'ready',
    collectionId: 'col-1',
    collectionName: 'Quantum Computing & QEC',
    metadata: {
      pages: 28,
      wordCount: 11400,
      language: 'English',
      author: 'A. Thorne, S. Varma, E. K. Chen et al.',
      tags: ['Quantum Computing', 'Surface Codes', 'Syndrome Extraction', 'FPGA Decoders'],
      summary: 'Empirical validation of rotated surface code lattices exhibiting sub-threshold exponential error suppression with Lambda = 2.14 under depolarizing circuit noise.',
      mimeType: 'application/pdf',
    },
    sections: [
      {
        id: 'sec-1-1',
        page: 1,
        title: 'Abstract & Executive Summary',
        content: 'In this work, we demonstrate real-time fault-tolerant syndrome extraction on a 72-qubit superconducting quantum processor. Under depolarizing noise p_phys = 1.15e-3, rotated planar surface code lattices of distance d=3, d=5, and d=7 exhibit sub-threshold exponential scaling with Lambda = 2.14 +/- 0.08.',
      },
      {
        id: 'sec-1-2',
        page: 4,
        title: 'Syndrome Decoding Latency & Thresholds',
        content: 'Syndrome decoding constitutes the critical path in active quantum error correction. Real-time neural-augmented Minimum Weight Perfect Matching (MWPM) decoders implemented on pipelined systolic FPGA architectures achieve single-round decoding in 380ns, comfortably inside the 1.2us coherence envelope. The fault-tolerance threshold is confirmed at p_th = 1.05e-2.',
      },
      {
        id: 'sec-1-3',
        page: 14,
        title: 'Cryogenic Readout & Thermal Dissipation',
        content: 'Analysis of sub-Kelvin dilution refrigerator heat loads reveals that standard RF attenuator stacks yield 42 uW per channel at the 15mK stage. Optical readout architectures using cryogenic micro-ring modulators are verified as the only viable path to 100k qubit scaling.',
      },
      {
        id: 'sec-1-4',
        page: 18,
        title: 'Logical Error Suppression Scaling',
        content: 'Physical-to-logical error suppression ratios reach Lambda = 2.14 +/- 0.08 with code distances d=5 and d=7, validating sub-threshold exponential scaling. P_L scales proportionally to Lambda^(-(d+1)/2).',
      },
    ],
    textContent: `Topological Surface Code Fault-Tolerance Thresholds Under Depolarizing Circuit Noise
Authors: A. Thorne, S. Varma, E. K. Chen et al. (Physical Review Letters 2025)

1. Executive Summary
In this work, we demonstrate real-time fault-tolerant syndrome extraction on a 72-qubit superconducting quantum processor. Under depolarizing noise p_phys = 1.15e-3, rotated planar surface code lattices of distance d=3, d=5, and d=7 exhibit sub-threshold exponential scaling with Lambda = 2.14 +/- 0.08.

2. Syndrome Extraction Latency
Syndrome decoding constitutes the critical path in active quantum error correction. Real-time neural-augmented Minimum Weight Perfect Matching (MWPM) decoders implemented on pipelined systolic FPGA architectures achieve single-round decoding in 380ns, comfortably inside the 1.2us coherence envelope. The circuit-level fault-tolerance threshold is confirmed at p_th = 1.05e-2.

3. Cryogenic Readout Constraints
Analysis of sub-Kelvin dilution refrigerator heat loads reveals that standard RF attenuator stacks yield 42 uW per channel at the 15mK stage. To prevent quenching the base plate cooling power (rated at 450 uW), optical readout architectures using cryogenic micro-ring modulators are verified as the only viable path to 100k qubit scaling.

4. Empirical Error Scaling
Physical-to-logical error suppression ratios reach Lambda = 2.14 +/- 0.08 with code distances d=5 and d=7, validating sub-threshold exponential scaling. Logical error rate P_L decreases exponentially with code distance d when p_phys < p_th.`,
  },
  {
    id: 'doc-2',
    workspaceId: 'ws-1',
    filename: 'Hardware_Accelerated_Neural_MWPM_Decoders.pdf',
    fileType: 'pdf',
    size: 2150000,
    uploadTimestamp: '2026-03-14T09:12:00Z',
    status: 'ready',
    collectionId: 'col-1',
    collectionName: 'Quantum Computing & QEC',
    metadata: {
      pages: 19,
      wordCount: 8900,
      language: 'English',
      author: 'M. R. Al-Hassan, D. Lin, J. Preskill',
      tags: ['Hardware Acceleration', 'Neural Networks', 'MWPM', 'Systolic Array'],
      summary: 'Systolic neural graph matching approximations executing bloom-approximated MWPM matching vectors in 380ns per cycle.',
      mimeType: 'application/pdf',
    },
    sections: [
      {
        id: 'sec-2-1',
        page: 2,
        title: 'Systolic Array Architecture',
        content: 'We present a systolic neural graph matching accelerator that computes blossom-approximated MWPM matching vectors in 380ns per cycle. Comparative benchmarks against classical Edmonds blossom algorithms demonstrate a 6.3x latency reduction while preserving 99.92% of the optimal pseudo-threshold.',
      },
      {
        id: 'sec-2-2',
        page: 8,
        title: 'Latency Budget Analysis',
        content: 'The total cycle latency budget comprises 85ns for syndrome extraction readout, 195ns for neural graph weights evaluation, and 100ns for correction pulse dispatch.',
      },
    ],
    textContent: `Hardware-Accelerated Neural Minimum Weight Perfect Matching for Quantum Decoders
Authors: M. R. Al-Hassan, D. Lin, J. Preskill (IEEE TQE 2025)

We present a systolic neural graph matching accelerator that computes blossom-approximated MWPM matching vectors in 380ns per cycle. Comparative benchmarks against classical Edmonds blossom algorithms demonstrate a 6.3x latency reduction while preserving 99.92% of the optimal pseudo-threshold.

The total cycle latency budget comprises 85ns for syndrome extraction readout, 195ns for neural graph weights evaluation, and 100ns for correction pulse dispatch. Through pipelined execution on custom FPGA chips, the system guarantees zero error drift across consecutive error syndrome rounds.`,
  },
  {
    id: 'doc-3',
    workspaceId: 'ws-1',
    filename: 'Hierarchical_Speculative_Multi_Agent_Reasoning.pdf',
    fileType: 'pdf',
    size: 4200000,
    uploadTimestamp: '2026-03-15T11:45:00Z',
    status: 'ready',
    collectionId: 'col-2',
    collectionName: 'Autonomous Agent Architectures',
    metadata: {
      pages: 36,
      wordCount: 14200,
      language: 'English',
      author: 'K. S. Mercer, V. Raman, H. Zhang',
      tags: ['Multi-Agent', 'Speculative Execution', 'Grounding', 'Hallucinations'],
      summary: 'Decoupling speculative trajectory proposals from formal constraint arbitration eliminates compound hallucinations from 14.8% down to 0.28%.',
      mimeType: 'application/pdf',
    },
    sections: [
      {
        id: 'sec-3-1',
        page: 3,
        title: 'Proposer-Verifier Decoupling',
        content: 'Autonomous reasoning pipelines suffer from compounding semantic drift across extended trajectory lengths. By separating reasoning agents into a speculative proposer tier and a formal verification quorum, we enforce deterministic citation grounding. Hallucinations drop from 14.8% to under 0.3%.',
      },
      {
        id: 'sec-3-2',
        page: 12,
        title: 'Deterministic Citation Vector Grounding',
        content: 'All claims lacking direct 1:1 attribution to indexed source chunks are pruned automatically before cross-turn memory consolidation. Cognitive throughput is improved by 19.4% on STEM reasoning tasks.',
      },
    ],
    textContent: `Hierarchical Speculative Execution and Deterministic Arbitration in Multi-Agent Reasoning Systems
Authors: K. S. Mercer, V. Raman, H. Zhang (NeurIPS 2025)

Autonomous reasoning pipelines frequently suffer from compounding semantic drift across extended trajectory lengths. By separating reasoning agents into a speculative proposer tier and a formal verification quorum, we enforce deterministic citation grounding. Evaluated on the ProofNet and ScienceQA-Hard benchmarks, this architecture achieved a 19.4% accuracy improvement while reducing ungrounded hallucinations to under 0.3%.

All claims lacking direct 1:1 attribution to indexed source chunks are pruned automatically before cross-turn memory consolidation.`,
  },
  {
    id: 'doc-4',
    workspaceId: 'ws-1',
    filename: 'Solid_State_Electrolyte_Interphases_LLZO_vs_Sulfides.pdf',
    fileType: 'pdf',
    size: 2800000,
    uploadTimestamp: '2026-03-16T15:30:00Z',
    status: 'ready',
    collectionId: 'col-3',
    collectionName: 'Solid-State Materials',
    metadata: {
      pages: 22,
      wordCount: 9500,
      language: 'English',
      author: 'Dr. Elena Rostova, J. K. Miller et al.',
      tags: ['Solid-State Battery', 'LLZO', 'Argyrodite', 'Lithium Metal'],
      summary: 'Comparative analysis of garnet-type LLZO ceramics versus argyrodite sulfides for next-generation lithium metal battery interfaces.',
      mimeType: 'application/pdf',
    },
    sections: [
      {
        id: 'sec-4-1',
        page: 2,
        title: 'Chemical Stability & Electrochemical Window',
        content: 'Garnet Li7La3Zr2O12 (LLZO) provides unmatched chemical stability against metallic lithium anodes (Delta V approx 0.05V), whereas argyrodite sulfides achieve superior room-temperature bulk ionic conductivity (> 1.2e-2 S/cm).',
      },
      {
        id: 'sec-4-2',
        page: 11,
        title: 'Dendrite Growth & Mechanical Shear Modulus',
        content: 'LLZO exhibits a high shear modulus (G approx 61 GPa), suppressing mechanical dendrite propagation along grain boundaries when external stack pressure is calibrated.',
      },
    ],
    textContent: `Solid-State Electrolyte Interphases: Garnet LLZO vs Argyrodite Sulfides
Authors: Dr. Elena Rostova, J. K. Miller et al. (Nature Materials 2025)

Garnet Li7La3Zr2O12 (LLZO) provides unmatched chemical stability against metallic lithium anodes (Delta V approx 0.05V), whereas argyrodite sulfides (e.g. Li6PS5Cl) achieve superior room-temperature bulk ionic conductivity (> 1.2e-2 S/cm) due to softer polarizable anion frameworks.

LLZO exhibits a high shear modulus (G approx 61 GPa), suppressing mechanical dendrite propagation along grain boundaries when external stack pressure is calibrated. However, interfacial void formation during rapid discharge requires stack pressures of 5-8 MPa.`,
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    workspaceId: 'ws-1',
    title: 'Fault-Tolerance Thresholds & Syndrome Decoding Latency',
    createdAt: '2026-03-18T14:10:00Z',
    updatedAt: '2026-03-18T14:25:00Z',
    mode: 'knowledge',
    documentIds: ['doc-1', 'doc-2'],
    messages: [
      {
        id: 'msg-1-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'What are the empirical fault-tolerance thresholds reported for rotated surface codes, and how does real-time decoding latency impact logical qubit stability?',
        timestamp: '14:20:12 UTC',
      },
      {
        id: 'msg-1-2',
        conversationId: 'conv-1',
        role: 'assistant',
        timestamp: '14:20:15 UTC',
        mode: 'knowledge',
        confidence: null,
        latencyMs: 168,
        tokenCount: {
          promptTokens: 210,
          completionTokens: 340,
          totalTokens: 550,
        },
        content: `Based on **Topological_Surface_Code_Fault_Tolerance_v2.pdf** and **Hardware_Accelerated_Neural_MWPM_Decoders.pdf**:

### 1. Empirical Fault-Tolerance Threshold
The circuit-level fault-tolerance threshold for rotated planar surface codes is confirmed at **$p_{th} \\approx 1.05 \\times 10^{-2}$** under depolarizing physical noise. For physical error rates below this threshold ($p_{phys} = 1.15 \\times 10^{-3}$), the physical-to-logical error suppression ratio reaches **$\\Lambda = 2.14 \\pm 0.08$** across code distances $d \\in \\{3, 5, 7\\}$.

### 2. Impact of Real-Time Decoding Latency
Real-time syndrome extraction is the single critical-path bottleneck in fault-tolerant operations:
- To prevent error compounding, syndrome extraction and graph matching must execute well within the **1.2µs coherence envelope** of superconducting qubits.
- Using pipelined systolic FPGA accelerators, single-round blossom-approximated MWPM decoding achieves a **380ns cycle latency**, ensuring that stabilizer eigenvalues are resolved without qubit phase drift.`,
        sources: [
          {
            document_id: 'doc-1',
            document_name: 'Topological_Surface_Code_Fault_Tolerance_v2.pdf',
            page: 4,
            section: 'Syndrome Decoding Latency & Thresholds',
            excerpt: 'Under depolarizing noise p_phys = 1.15e-3, rotated planar surface code lattices of distance d=3, d=5, and d=7 exhibit sub-threshold exponential scaling with Lambda = 2.14 +/- 0.08. Syndrome decoding executed through custom FPGA matrix decoders reached 380ns mean latency per measurement cycle, safely within the 1.2us coherence margin.',
          },
          {
            document_id: 'doc-2',
            document_name: 'Hardware_Accelerated_Neural_MWPM_Decoders.pdf',
            page: 2,
            section: 'Systolic Array Architecture',
            excerpt: 'We present a systolic neural graph matching accelerator that computes blossom-approximated MWPM matching vectors in 380ns per cycle. Comparative benchmarks against classical Edmonds blossom algorithms demonstrate a 6.3x latency reduction while preserving 99.92% of the optimal pseudo-threshold.',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-2',
    workspaceId: 'ws-1',
    title: 'Decoupled Multi-Agent Reasoning Synthesis',
    createdAt: '2026-03-17T11:00:00Z',
    updatedAt: '2026-03-17T11:30:00Z',
    mode: 'research',
    documentIds: ['doc-3'],
    messages: [
      {
        id: 'msg-2-1',
        conversationId: 'conv-2',
        role: 'user',
        content: 'Explain how hierarchical multi-agent architectures decouple speculative execution from deterministic verification to mitigate hallucinations.',
        timestamp: '11:15:00 UTC',
      },
      {
        id: 'msg-2-2',
        conversationId: 'conv-2',
        role: 'assistant',
        timestamp: '11:15:03 UTC',
        mode: 'research',
        confidence: null,
        latencyMs: 145,
        content: `According to **Hierarchical_Speculative_Multi_Agent_Reasoning.pdf**:

Decoupling reasoning systems into a **Proposer-Verifier Quorum** resolves compounding semantic drift:
1. **Speculative Proposer Tier**: Operates with exploratory freedom to generate multi-step hypothesis trees.
2. **Deterministic Verification Quorum**: Strictly checks claims against indexed vector chunks. Any assertion lacking a 1:1 attribution is pruned before memory consolidation.
3. **Empirical Outcome**: Unchecked hallucinations drop from 14.8% down to **< 0.3%**, with a 19.4% net gain on STEM reasoning benchmarks.`,
        sources: [
          {
            document_id: 'doc-3',
            document_name: 'Hierarchical_Speculative_Multi_Agent_Reasoning.pdf',
            page: 3,
            section: 'Proposer-Verifier Decoupling',
            excerpt: 'Autonomous reasoning pipelines frequently suffer from compounding semantic drift across extended trajectory lengths. By separating reasoning agents into a speculative proposer tier and a formal verification quorum, we enforce deterministic citation grounding.',
          },
        ],
      },
    ],
  },
];

export const INITIAL_LOGS: ObservabilityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-19T21:00:15Z',
    type: 'ai_generation_completed',
    message: 'Grounded response generated for conv-1 (query: "fault-tolerance thresholds")',
    latencyMs: 168,
    details: { sourcesCount: 2, model: 'gemini-3.8-flash' },
  },
  {
    id: 'log-2',
    timestamp: '2026-03-19T21:00:14Z',
    type: 'ai_generation_started',
    message: 'Initiating Gemini grounding for query with 2 contextual documents',
    details: { docIds: ['doc-1', 'doc-2'] },
  },
  {
    id: 'log-3',
    timestamp: '2026-03-19T20:55:00Z',
    type: 'doc_processing_completed',
    message: 'Processed and indexed Topological_Surface_Code_Fault_Tolerance_v2.pdf (28 pages)',
    latencyMs: 412,
  },
  {
    id: 'log-4',
    timestamp: '2026-03-19T20:54:59Z',
    type: 'doc_processing_started',
    message: 'Started semantic chunking & metadata extraction for doc-1',
  },
];
