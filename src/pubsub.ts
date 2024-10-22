import { createPubSub } from "graphql-yoga";

type PubSubChannels = {};

export const pubSub = createPubSub<PubSubChannels>();
