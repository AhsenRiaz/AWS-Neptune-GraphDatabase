import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DiningByFriendsGraphDatabase from '../lib/dining_by_friends_graph_database-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DiningByFriendsGraphDatabase.DiningByFriendsGraphDatabaseStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
