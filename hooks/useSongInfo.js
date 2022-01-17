//This function will return the song info based on the id of the song
//when you fetch the track it gives the info about the song
//diffrently when we play a song - both gives us the id of the song
//we will take the song id and bring back the information needded
//for both wheater they where selected from the playlist or selected from the songlist

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { refreshTokenErr } from "../lib/spotify";
import SpotifyWebApi from "spotify-web-api-node";
import useSpotify from "./useSpotify";
import { useRecoilState } from "recoil";
import { currentTrackIdState } from "../atoms/songAtom";

function useSongInfo() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [songInfo, setSongInfo] = useState(null);

  //fetch the song info - fetch from the fronend
  useEffect(() => {
    const fetchSongInfo = async () => {
      //if there was a selected track already
      //headers have the bearer authorisation with the access token we have

      if (currentTrackId) {
        const trackInfo = await fetch(
          `https://api.spotify.com/v1/tracks/${currentTrackId}`,
          {
            headers: {
              Authorization: `Bearer ${spotifyApi.getAccessToken()}`,
            },
          }
        ).then((res) => res.json());

        setSongInfo(trackInfo);
      }
    };
    fetchSongInfo();
  }, [currentTrackId, spotifyApi]);

  return songInfo;
}

export default useSongInfo;
