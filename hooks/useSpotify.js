import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { refreshTokenErr } from "../lib/spotify";
import SpotifyWebApi from "spotify-web-api-node";

//initialize the spotifyApi for the client
//it was already initialised for the server in the file: lib/spotify.js
//
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
});

function useSpotify() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (session) {
      //If refresh token acces attempt fails, direct user to login,,,
      if (session.error === refreshTokenErr) {
        signIn();
      }
      spotifyApi.setAccessToken(session.user.accessToken);
    }
  }, [session, status]);

  return spotifyApi;
}

export default useSpotify;
