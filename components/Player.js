import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
} from "@heroicons/react/outline";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplyIcon,
  RewindIcon,
  VolumeUpIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";

import { useState, useEffect, useCallback, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";
import { debounce } from "lodash";
import { playlistState } from "../atoms/playlistAtom";

function Player() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(50);

  const songInfo = useSongInfo();

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        console.log("Now playing", data.body?.item);
        setCurrentTrackId(data.body?.item?.id);
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };

  const handlePlayPause = () => {
    // let fistItemTrack = playList?.tracks.items[0].track || false;
    // spotifyApi.getMyCurrentPlaybackState().then((data) => {
    //   if (data && data.body && data.body.is_playing) {
    //     spotifyApi.pause({ device_id: deviceid });
    //     setIsPlaying(false);
    //   } else {
    //     if (!currentTrackId) {
    //       spotifyApi.play({
    //         uris: [fistItemTrack.uri],
    //         device_id: deviceid,
    //       });
    //       setIsPlaying(true);
    //   //    setCurrentTrackId(fistItemTrack.id);
    //     } else {
    //       spotifyApi.play({ device_id: deviceid });
    //       setIsPlaying(true);
    //     }
    //   }
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data?.body?.is_playing) {
        console.log("data");
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  //useCallback - allows us to have memorize function
  //on the mount of this component - if I have nothing ton the dependencies
  //create the function once and dont' keep creating it ever again
  //and than we can debounce this function
  //so the input stops after 500ms and than call this function
  const debouncedAdjustVolume = useCallback(
    debounce((volume) => {
      console.log(volume);
      spotifyApi.setVolume(volume).catch((e) => {
        console.log("error", e);
      });
    }, 500),
    []
  );

  //useEffect is to fetch the info for the component use
  //so it (images) will not disapear everytime we refresh the screen
  useEffect(() => {
    if (spotifyApi.getAccessToken && !currentTrackId) {
      fetchCurrentSong();
      setVolume(50);
    }
  }, [currentTrackIdState, spotifyApi, session]);

  //When the volume changes
  //if the volume is in the range - we will call the function debounceAdjustVolume
  // that will change the volume to the new Volume it is
  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debouncedAdjustVolume(volume);
    }
  }, [volume]);

  return (
    <div
      className="h-24 bg-gradient-to-b from-black h-24 bg-gradient-to-b from-black 
    to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8o"
    >
      {/* Left of player */}
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline w-10 h-10"
          src={songInfo?.album?.images?.[0]?.url}
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0].name}</p>
        </div>
      </div>
      {/* Center */}
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon
          //  onClick={() => spotifyApi.skipToPrevious()}
          className="button"
        />
        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
        ) : (
          <PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />
        )}

        <FastForwardIcon className="button" />
        <ReplyIcon className="button" />
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <VolumeDownIcon
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className="button"
        />
        <input
          className="w-14 md:w-28"
          type="range"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          min={0}
          mac={100}
        />
        <VolumeUpIcon
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className="button"
        />
      </div>
    </div>
  );
}

export default Player;
