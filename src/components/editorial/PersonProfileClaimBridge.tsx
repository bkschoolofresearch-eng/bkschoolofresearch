'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PersonProfile,
  type PersonMemberAchievementItem,
  type PersonProfileData,
  type PersonRoleHistoryItem,
  type PersonVerifiedAchievementItem,
} from '@/components/editorial/PersonProfile';
import { useAuthOptional } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import {
  formatSocialLinksInput,
  parseSocialLinksInput,
  pickMemberPersonPatch,
} from '@/lib/auth/permissions';
import { contentRepository } from '@/lib/cms/repository';
import {
  addMemberAchievement,
  deleteMemberAchievement,
  getMemberAchievementsForPerson,
  getRoleAssignmentsForPerson,
  getVerifiedAchievementsForPerson,
} from '@/lib/content/people-ops';
import { getResolvedInvolvementsForPerson } from '@/lib/content/person-links';
import { slugify } from '@/lib/utils';
import type { Person } from '@/types/content';

type Related = {
  href: string;
  name: string;
  role: string;
  imageSrc: string;
};

type PersonProfileClaimBridgeProps = {
  personId: string;
  initialPerson: PersonProfileData;
  related?: Related[];
};

const inputClass =
  'mt-1.5 w-full border border-border bg-paper px-3 py-2 font-sans text-sm outline-none focus:border-accent';

function mapRoleHistory(personId: string): PersonRoleHistoryItem[] {
  const db = contentRepository.getDatabase();
  return getRoleAssignmentsForPerson(db, personId).map((row) => ({
    id: row.id,
    year: row.year,
    role: row.role,
  }));
}

function mapVerified(personId: string): PersonVerifiedAchievementItem[] {
  const db = contentRepository.getDatabase();
  return getVerifiedAchievementsForPerson(db, personId).map((row) => ({
    id: row.assignment.id,
    title: row.achievement!.title,
    description: row.achievement!.description,
    certificateCode: row.assignment.certificateCode ?? null,
    assignedAt: row.assignment.assignedAt,
  }));
}

function mapMember(personId: string): PersonMemberAchievementItem[] {
  const db = contentRepository.getDatabase();
  return getMemberAchievementsForPerson(db, personId).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    year: row.year,
  }));
}

export function PersonProfileClaimBridge({
  personId,
  initialPerson,
  related,
}: PersonProfileClaimBridgeProps) {
  const auth = useAuthOptional();
  const isOwner =
    auth?.ready &&
    auth.session?.role === 'member' &&
    auth.session.personId === personId;

  const [cmsPerson, setCmsPerson] = useState<Person | null>(null);
  const [involvements, setInvolvements] = useState(
    initialPerson.involvements ?? [],
  );
  const [roleHistory, setRoleHistory] = useState(
    initialPerson.roleHistory ?? [],
  );
  const [verifiedAchievements, setVerifiedAchievements] = useState(
    initialPerson.verifiedAchievements ?? [],
  );
  const [memberAchievements, setMemberAchievements] = useState(
    initialPerson.memberAchievements ?? [],
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [name, setName] = useState(initialPerson.name);
  const [shortBio, setShortBio] = useState(initialPerson.shortBio ?? '');
  const [bio, setBio] = useState(initialPerson.bio);
  const [photoUrl, setPhotoUrl] = useState(initialPerson.photoUrl ?? '');
  const [affiliation, setAffiliation] = useState(initialPerson.affiliation ?? '');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState(
    (initialPerson.skills ?? []).join(', '),
  );
  const [socialRaw, setSocialRaw] = useState('');
  const [newAchievementTitle, setNewAchievementTitle] = useState('');
  const [newAchievementYear, setNewAchievementYear] = useState('');
  const [newAchievementDesc, setNewAchievementDesc] = useState('');

  const refreshExtras = () => {
    setInvolvements(getResolvedInvolvementsForPerson(
      contentRepository.getDatabase(),
      personId,
    ));
    setRoleHistory(mapRoleHistory(personId));
    setVerifiedAchievements(mapVerified(personId));
    setMemberAchievements(mapMember(personId));
  };

  useEffect(() => {
    const db = contentRepository.getDatabase();
    const fromCms = db.people.find((p) => p.id === personId) as
      | Person
      | undefined;
    if (fromCms) {
      setCmsPerson(fromCms);
      setName(fromCms.name);
      setShortBio(fromCms.shortBio ?? '');
      setBio(fromCms.bio);
      setPhotoUrl(fromCms.photoUrl ?? '');
      setAffiliation(fromCms.affiliation ?? '');
      setPhone(fromCms.phone ?? '');
      setInterests((fromCms.researchInterests ?? []).join(', '));
      setSocialRaw(formatSocialLinksInput(fromCms.socialLinks));
    }
    refreshExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per personId
  }, [personId]);

  const displayPerson: PersonProfileData = useMemo(() => {
    const base = cmsPerson
      ? {
          ...initialPerson,
          name: cmsPerson.name,
          role: cmsPerson.role,
          affiliation: cmsPerson.affiliation,
          photoUrl: cmsPerson.photoUrl,
          bio: cmsPerson.bio,
          shortBio: cmsPerson.shortBio,
          skills: cmsPerson.researchInterests,
          verificationCode: isOwner ? cmsPerson.verificationCode : undefined,
          appointmentYear: cmsPerson.appointmentYear,
        }
      : initialPerson;
    return {
      ...base,
      researchItems: involvements.length ? [] : base.researchItems,
      involvements,
      roleHistory,
      verifiedAchievements,
      memberAchievements,
    };
  }, [
    cmsPerson,
    isOwner,
    initialPerson,
    involvements,
    roleHistory,
    verifiedAchievements,
    memberAchievements,
  ]);

  const onSave = () => {
    setSaving(true);
    setMessage(null);
    const patch = pickMemberPersonPatch({
      name: name.trim(),
      shortBio: shortBio.trim(),
      bio: bio.trim(),
      photoUrl: photoUrl.trim() || null,
      affiliation: affiliation.trim() || undefined,
      phone: phone.trim() || undefined,
      researchInterests: interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      socialLinks: parseSocialLinksInput(socialRaw),
    });

    if (patch.name && cmsPerson) {
      const oldSlug = cmsPerson.slug;
      const expected = slugify(cmsPerson.name);
      if (!oldSlug || oldSlug === expected) {
        contentRepository.update('people', personId, {
          ...patch,
          slug: slugify(patch.name),
        });
      } else {
        contentRepository.update('people', personId, patch);
      }
    } else {
      contentRepository.update('people', personId, patch);
    }

    const refreshed = contentRepository
      .getDatabase()
      .people.find((p) => p.id === personId) as Person | undefined;
    setCmsPerson(refreshed ?? null);
    setSaving(false);
    setEditing(false);
    setMessage('Saved locally in this browser (demo).');
    window.setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div>
      {isOwner ? (
        <div className="border-b border-accent/20 bg-sage/35">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent">
                Your profile
              </p>
              <p className="text-sm text-body">
                Demo: edits stay in this browser until a backend is connected.
                {cmsPerson?.verificationCode
                  ? ` Code ${cmsPerson.verificationCode}.`
                  : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {message ? (
                <span className="text-xs font-medium text-accent">{message}</span>
              ) : null}
              <Button
                type="button"
                variant={editing ? 'secondary' : 'ink'}
                size="sm"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? 'Close editor' : 'Edit profile'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isOwner && editing ? (
        <div className="border-b border-border bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:px-8">
            <label className="block text-sm font-semibold text-ink">
              Name
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Affiliation
              <input
                className={inputClass}
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Phone
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Photo URL
              <input
                className={inputClass}
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              Short bio
              <textarea
                className={inputClass}
                rows={2}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              Biography
              <textarea
                className={inputClass}
                rows={8}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              Research interests (comma-separated)
              <input
                className={inputClass}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              Social links (one per line: Label|https://…)
              <textarea
                className={inputClass}
                rows={3}
                value={socialRaw}
                onChange={(e) => setSocialRaw(e.target.value)}
              />
            </label>

            <div className="space-y-3 border-t border-border pt-4 sm:col-span-2">
              <p className="text-sm font-semibold text-ink">
                Member achievements (unverified)
              </p>
              <p className="text-xs text-muted">
                Role history and BKSR-verified achievements are admin-only.
              </p>
              <ul className="space-y-2">
                {memberAchievements.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {item.title}
                      {item.year ? ` (${item.year})` : ''}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline"
                      onClick={() => {
                        deleteMemberAchievement(item.id);
                        refreshExtras();
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Title"
                  value={newAchievementTitle}
                  onChange={(e) => setNewAchievementTitle(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Year (optional)"
                  value={newAchievementYear}
                  onChange={(e) => setNewAchievementYear(e.target.value)}
                />
                <textarea
                  className={`${inputClass} sm:col-span-2`}
                  rows={2}
                  placeholder="Description (optional)"
                  value={newAchievementDesc}
                  onChange={(e) => setNewAchievementDesc(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper sm:col-span-2"
                  onClick={() => {
                    if (!newAchievementTitle.trim()) return;
                    addMemberAchievement({
                      personId,
                      title: newAchievementTitle,
                      year: newAchievementYear || undefined,
                      description: newAchievementDesc || undefined,
                    });
                    setNewAchievementTitle('');
                    setNewAchievementYear('');
                    setNewAchievementDesc('');
                    refreshExtras();
                  }}
                >
                  Add achievement
                </button>
              </div>
            </div>

            <p className="text-xs text-muted sm:col-span-2">
              Role, category, email, and verification code stay admin-only.
            </p>
            <div className="flex gap-3 sm:col-span-2">
              <Button
                type="button"
                variant="primary"
                disabled={saving}
                onClick={onSave}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <PersonProfile person={displayPerson} related={related} />
    </div>
  );
}
