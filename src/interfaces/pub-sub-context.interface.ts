import { pubSub } from "../pubsub";

export interface PubSubContext {
  pubSub: typeof pubSub;
}
