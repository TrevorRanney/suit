import { Selector } from 'testcafe';

//tests ../example/server.js
fixture('Test basic server').page('http://localhost:3456');

test('Can serve a component in a component', async webpage => {
    await webpage.expect(Selector('body').innerText).contains("I am a basic component XD");
});

test('Can load variables', async webpage => {
    await webpage.expect(Selector('body').innerText).contains("XD XD");
});
