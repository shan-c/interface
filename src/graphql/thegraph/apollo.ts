import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache } from '@apollo/client'
import { SupportedChainId } from 'constants/chains'

import store from '../../state/index'

const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  [SupportedChainId.TESTNET]: 'https://dev.orbitmarket.io/subgraphs/name/orbital-apes-labs/v3-subgraph',
  [SupportedChainId.FUJI]: 'https://api.thegraph.com/subgraphs/name/orbital-apes-labs/v3-subgraph',
}

const httpLink = new HttpLink({ uri: CHAIN_SUBGRAPH_URL[SupportedChainId.MAINNET] })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const chainId = store.getState().application.chainId

  operation.setContext(() => ({
    uri:
      chainId && CHAIN_SUBGRAPH_URL[chainId]
        ? CHAIN_SUBGRAPH_URL[chainId]
        : CHAIN_SUBGRAPH_URL[SupportedChainId.MAINNET],
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
})
