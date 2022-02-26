import config from '../config';
import {TweetV1, TwitterApi} from 'twitter-api-v2';

const {api_key, api_secret, token, token_secret} = config;

export default class TwitterHelperClass {
  public client = new TwitterApi({
    appKey: api_key,
    appSecret: api_secret,
    accessToken: token,
    accessSecret: token_secret,
  }).readOnly;

  public resolveId(url: string) {
    const matches = url.match(/(\d{16,})/);
    return matches ? matches[0] : null;
  }

  public resolveMedia(tweet: TweetV1) {
    const username = tweet.user.screen_name;
    const tweetId = tweet.id_str;
    const resolvedMedia: IResolvedMedia[] = [];

    if (tweet.extended_entities && tweet.extended_entities.media) {
      const mediaCount = (idx: number) => (tweet.extended_entities!.media!.length > 1 ? (idx + 1).toString() : '');

      tweet.extended_entities.media.forEach((m, idx) => {
        let filename = `${username} - ${tweetId} ${mediaCount(idx)}`.trim();
        let extension = m.media_url.match(/(?!\.)\w{3,4}(?=$|\?)/)![0];
        let url = m.media_url;

        if (m.video_info) {
          const bitrates = m.video_info.variants.map(v => v.bitrate || 0);
          const maxBitrate = Math.max(...bitrates);
          const video = m.video_info.variants.find(v => v.bitrate === maxBitrate);

          if (!video) {
            return;
          }

          extension = video!.url.match(/(?!\.)\w{3,4}(?=$|\?)/)![0];
          url = video!.url;
        }

        resolvedMedia.push({filename, extension, url});
      });
    }

    return resolvedMedia;
  }
}

export interface IResolvedMedia {
  filename: string;
  extension: string;
  url: string;
}
