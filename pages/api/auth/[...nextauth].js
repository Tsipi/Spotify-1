import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";

async function refreshAccessToken(token) {
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);
    //destructure the response
    //renaming the body with a new name refreshedToken
    const { body: refreshedToken } = await spotifyApi.refreshAccessToken();

    console.log("refreshed token is: ", refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: date.now + refreshedToken.expires_in * 1000, //one hour return from the spotifyAPI
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
      //replace if new one came back else fall back to old refresh token
    };
  } catch (error) {
    console.error(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    //destructure the token, account, user
    async jwt({ token, account, user }) {
      //if it was the initial sign in
      if (account && user) {
        console.log("Token isvalid");
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000, //we handeling times in miliseconds
        };
      }

      //refresh Token
      //return the previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        console.log("EXISTING ACCESS TOKEN IS VALID");
        return token;
      }
      //if the access token has expired after an hour we need to refresh it
      console.log("ACCESS TOKEN HAS EXPIRED, REFRESHING...");
      return await refreshAccessToken(token);
    },
    //create the session object with the token-
    //is what the user will be able to tap into as part of their client session
    //
    async session({ session, token }) {
      session.user.accessToken = token.accessToken; //allocate the accessToken to the session.user
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    },
  },
});
