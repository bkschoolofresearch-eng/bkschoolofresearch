import { jsonOk } from '@/lib/cms/api-guard';
import { serverGetFullDatabase } from '@/lib/cms/server-repository';
import {
  countEntriesForForm,
  resolveFormForEvent,
  resolveFormForVacancy,
} from '@/lib/content/registration-forms';
import {
  findByCertificateCode,
  findPersonByVerificationCode,
} from '@/lib/content/people-ops';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const noticeId = searchParams.get('noticeId');
  const code = searchParams.get('code');

  const db = await serverGetFullDatabase();

  if (code) {
    const normalized = code.trim().toUpperCase();
    const person = findPersonByVerificationCode(db, normalized);
    if (person) {
      return jsonOk({
        kind: 'member',
        name: person.name,
        role: person.role,
        href: `/people/${person.slug}`,
      });
    }
    const cert = findByCertificateCode(db, normalized);
    if (cert?.person) {
      return jsonOk({
        kind: 'certificate',
        name: cert.person.name,
        achievement: cert.achievement?.title ?? 'Achievement',
        href: `/people/${cert.person.slug}`,
      });
    }
    return jsonOk({ kind: 'none' });
  }

  if (eventId) {
    const event = db.events.find((e) => e.id === eventId);
    const form = event ? resolveFormForEvent(db, event) : undefined;
    if (!form || form.status !== 'published') {
      return jsonOk({ form: null, entryCount: 0 });
    }
    return jsonOk({
      form: {
        id: form.id,
        slug: form.slug,
        title: form.title,
        isOpen: form.isOpen,
        status: form.status,
        maxSubmissions: form.maxSubmissions ?? null,
        closedMessage: form.closedMessage,
      },
      entryCount: countEntriesForForm(db, form.id),
    });
  }

  if (noticeId) {
    const notice = db.notices.find((n) => n.id === noticeId);
    const form = notice ? resolveFormForVacancy(db, notice) : undefined;
    if (!form || form.status !== 'published') {
      return jsonOk({ form: null, entryCount: 0 });
    }
    return jsonOk({
      form: {
        id: form.id,
        slug: form.slug,
        title: form.title,
        isOpen: form.isOpen,
        status: form.status,
        maxSubmissions: form.maxSubmissions ?? null,
        closedMessage: form.closedMessage,
      },
      entryCount: countEntriesForForm(db, form.id),
    });
  }

  return jsonOk({ ok: true });
}
