import { Selector } from 'testcafe';

//tests ../example/server.js
fixture `Test basic server`
    .page `localhost:8888`;
test('Can serve content', async t => {
    await t
        .expect(Selector('body').innerText).contains("HELLO WORLD");
});