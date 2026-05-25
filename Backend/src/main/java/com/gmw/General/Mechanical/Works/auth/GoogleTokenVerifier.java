package com.gmw.General.Mechanical.Works.auth;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Component
public class GoogleTokenVerifier {

	private final GoogleIdTokenVerifier verifier;

	public GoogleTokenVerifier(@Value("${google.oauth.client-id}") String clientId) {
		this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
				.setAudience(Collections.singletonList(clientId))
				.build();
	}

	public GoogleIdToken.Payload verify(String idToken) {
		try {
			GoogleIdToken token = verifier.verify(idToken);
			if (token == null) {
				throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google sign-in token");
			}
			return token.getPayload();
		} catch (ResponseStatusException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google sign-in token");
		}
	}
}
