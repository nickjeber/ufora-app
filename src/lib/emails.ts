// Email drafts for submission decisions. For now these open in the reviewer's
// own mail app; later the same text can be sent automatically.

export type Draft = { to: string; subject: string; body: string };

type Release = { release_type: string | null; release_title: string | null };

export function releaseLabel({ release_type, release_title }: Release) {
  if (release_title) return `“${release_title}”`;
  const kind = { album: "album", ep: "EP", single: "single", demo: "demo" }[release_type ?? ""];
  return kind ? `your ${kind}` : "your music";
}

export function signedEmail(to: string, artistName: string, release: Release, inviteUrl: string): Draft {
  return {
    to,
    subject: `Welcome to Ufora, ${artistName}`,
    body: `Hi ${artistName},

We listened to ${releaseLabel(release)}, and we’d love to sign you.

Here’s what that means. You keep your masters, your name and your sound, and we’ll never give you creative direction. Ufora handles licensing, booking, contracts and payments, and takes 5% only on income that comes through us. Joining is free, and either of us can end it at any time.

Set up your artist page here. The link is just for you, so use this email address:
${inviteUrl}

Once you’re in, add your photo, bio and music, and we’ll start putting you in front of the people who book and license.

Welcome to Ufora.`,
  };
}

export function passEmail(to: string, artistName: string, release: Release, submitUrl: string): Draft {
  return {
    to,
    subject: `About ${releaseLabel(release)}`,
    body: `Hi ${artistName},

Thank you for sending us ${releaseLabel(release)}. We listened, and we’re not going to sign you right now.

That isn’t a verdict on you as an artist. We sign a small number of artists, and the fit has to be right for both of us.

Please keep sending us your work. Every new album, EP, single or demo gets a fresh listen:
${submitUrl}

Keep making the music only you can make.

Ufora`,
  };
}

export function mailtoHref({ to, subject, body }: Draft) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
