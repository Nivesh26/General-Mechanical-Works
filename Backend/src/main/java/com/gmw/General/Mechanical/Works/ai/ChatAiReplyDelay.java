package com.gmw.General.Mechanical.Works.ai;

final class ChatAiReplyDelay {

	private static final long MIN_REPLY_DELAY_MS = 2_500;

	private ChatAiReplyDelay() {
	}

	static void ensureMinimumDelay(long startedAtMs) {
		long remaining = MIN_REPLY_DELAY_MS - (System.currentTimeMillis() - startedAtMs);
		if (remaining <= 0) {
			return;
		}
		try {
			Thread.sleep(remaining);
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
		}
	}
}
