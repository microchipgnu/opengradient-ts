import { ethers } from 'ethers';
import { ModelInput, NumberTensor, StringTensor } from './types';

export function convertToModelInput(inputs: Record<string, number[] | string[]>): ModelInput {
  const numbers: NumberTensor[] = [];
  const strings: StringTensor[] = [];

  for (const [name, values] of Object.entries(inputs)) {
    if (typeof values[0] === 'number') {
      numbers.push({
        name,
        values: (values as number[]).map(v => [
          ethers.BigNumber.from(Math.floor(v * 1e6)),
          6
        ])
      });
    } else {
      strings.push({
        name,
        values: values as string[]
      });
    }
  }

  return { numbers, strings };
} 