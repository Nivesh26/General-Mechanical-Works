package com.gmw.General.Mechanical.Works.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public record ProfilePatchResponse(UserProfileDto profile, String accessToken) {
}
