import TutorialToken from './ABI/build/contracts/TutorialToken.json'
import PaymentPipe from './ABI/build/contracts/PaymentPipe.json';
import ExternalContractExample from './ABI/build/contracts/ExternalContractExample.json';

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:process.env.ETHEREUM_NODE_PORT'
    }
  },
  contracts: [
    TutorialToken,
    ExternalContractExample,
    PaymentPipe
  ],
  events: {
    SimpleStorage: ['StorageSet'],
    ExternalContractExample: ['ExternalContractPaid']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
