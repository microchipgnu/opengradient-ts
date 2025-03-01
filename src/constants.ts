export const INFERENCE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "components": [
                  {
                    "internalType": "int128",
                    "name": "value",
                    "type": "int128"
                  },
                  {
                    "internalType": "int128",
                    "name": "decimals",
                    "type": "int128"
                  }
                ],
                "internalType": "struct TensorLib.Number[]",
                "name": "values",
                "type": "tuple[]"
              }
            ],
            "internalType": "struct TensorLib.MultiDimensionalNumberTensor[]",
            "name": "numbers",
            "type": "tuple[]"
          }
        ],
        "indexed": false,
        "internalType": "struct ModelOutput",
        "name": "output",
        "type": "tuple"
      }
    ],
    "name": "InferenceResult",
    "type": "event"
  }
  // ... Add other ABI entries
];

export const PRICE_HISTORY_INFERENCE_ABI = [
  // Copy from src/opengradient/abi/PriceHistoryInference.abi
];

export const WORKFLOW_SCHEDULER_ABI = [
  // Copy from src/opengradient/abi/WorkflowScheduler.abi
];

export const WORKFLOW_SCHEDULER_ADDRESS = '0x8383C9bD7462F12Eb996DD02F78234C0421A6FaE'; 