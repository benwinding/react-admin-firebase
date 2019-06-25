import { deleteCollection } from "./test-helpers";
import { FirebaseWrapperStub } from "./FirebaseWrapperStub";
import { IFirebaseWrapper } from "../src/providers/database/firebase/IFirebaseWrapper";

import { config } from './TEST.config';
import { ResourceManager } from "../src/providers/database/ResourceManager";
const fire: IFirebaseWrapper = new FirebaseWrapperStub();
fire.init(config, {});
const db = fire.db();

test('rootref1', async () => {
  const rm = new ResourceManager(fire, {
    rootRef: 'root-ref1/ok'
  })
  await rm.TryGetResourcePromise('t1');

  await deleteCollection(db, 't1');
}, 10000);
