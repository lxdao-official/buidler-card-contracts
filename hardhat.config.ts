import * as dotenv from 'dotenv';

import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-abi-exporter';

dotenv.config();

const { INFURA_API_KEY, POLYGONSCAN_API_KEY, MAINNET_ETHERSCAN_API_KEY, OP_ETHERSCAN_API_KEY } = process.env;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    // goerli: {
    //   url: `https://eth-goerli.alchemyapi.io/v2/${INFURA_API_KEY}`,
    //   accounts: [PRIVATE_KEY],
    // },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    // polygon_mumbai: {
    //   url: "https://rpc-mumbai.maticvigil.com",
    //   accounts: [process.env.PRIVATE_KEY],
    // },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    optimisticSepolia: {
      chainId: 11155420,
      url: `https://optimism-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    optimisticEthereum: {
      chainId: 10,
      url: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      goerli: MAINNET_ETHERSCAN_API_KEY as string,
      mainnet: MAINNET_ETHERSCAN_API_KEY as string,
      polygon: POLYGONSCAN_API_KEY as string,
      // polygon_mumbai: POLYGONSCAN_API_KEY,
      optimisticEthereum: OP_ETHERSCAN_API_KEY as string,
      optimisticSepolia: OP_ETHERSCAN_API_KEY as string
    },
    customChains: [
      {
        network: 'optimisticSepolia',
        chainId: 11155420,
        urls: {
          apiURL: 'https://api-sepolia-optimistic.etherscan.io/api',
          browserURL: 'https://sepolia-optimism.etherscan.io',
        },
      },
      {
        network: 'optimisticEthereum',
        chainId: 10,
        urls: {
          apiURL: 'https://api-optimistic.etherscan.io/api',
          browserURL: 'https://optimistic.etherscan.io',
        },
      },
    ],
  },
};

export default config;
