import * as http from 'http';
import * as download from 'image-downloader';
import config from './config';
import TwitterHelperClass from './lib/twitter.helper.class';

const twitterHelper = new TwitterHelperClass();

const server = http.createServer();
server.listen(config.port);

console.log(`Server listening on ${config.port}`);

server.on('request', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Invalid request method.');
    }

    const buffers: any[] = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const reqJson = JSON.parse(Buffer.concat(buffers).toString()) as {
      url: string;
    };

    if (!reqJson || !reqJson.url) {
      throw new Error(`Invalid request JSON: \n${reqJson || JSON.stringify(buffers)}`);
    }

    console.log(`Recieved request: ${reqJson}`);

    const resolvedId = twitterHelper.resolveId(reqJson.url);

    if (resolvedId === null) {
      throw new Error('Blog post data could not be resolved');
    }

    const tweet = (await twitterHelper.client.v1.tweets(resolvedId))[0];
    const media = twitterHelper.resolveMedia(tweet);

    await Promise.all(
      media.map(m => {
        return download.image({
          url: m.url,
          dest: `${config.downloadPath}/${m.filename}.${m.extension}`,
          extractFilename: false,
        });
      }),
    ).catch(e => {
      console.error(e);
      throw new Error(e);
    });

    res.writeHead(200);
    res.end(`Downloaded ${media.length} files from ${reqJson.url}`);
  } catch (error) {
    console.error(error);
    res.writeHead(404);
    res.end(`Invalid request.`);
  }
});
