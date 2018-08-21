import PaymentPipe from '../build/contracts/PaymentPipe.json';
import ExternalContractExample from '../build/contracts/ExternalContractExample.json';
import FundingApplications from "../build/contracts/FundingApplications.json";
import OPCToken from "../build/contracts/OPCToken.json";

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:process.env.ETHEREUM_NODE_PORT'
    }
  },
  contracts: [
    ExternalContractExample,
    PaymentPipe,
    FundingApplications,
    OPCToken,
  ],
  events: {
    ExternalContractExample: ['ExternalContractPaid']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
