'use client'

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  FileCode2,
  GraduationCap,
  MessageCircle,
  Play,
  Target,
  UserRound,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/JsS2aKiVHXhKCzJ1B5a7rB'

const benefits = [
  {
    icon: Play,
    number: '01',
    title: 'Recorded videos & live classes',
    description:
      'Join guided live classes and revisit recorded coding lessons whenever you need a refresher or a better explanation.',
  },
  {
    icon: FileCode2,
    number: '02',
    title: 'Useful notes & study resources',
    description:
      'Find easy-to-follow notes, code examples, and curated learning resources to make your next step clearer.',
  },
  {
    icon: Target,
    number: '03',
    title: 'Build real confidence',
    description:
      'Practise with projects and assignments, ask questions, and turn new concepts into skills you can use.',
  },
]

const mentors = [
  {
    name: 'Som Singh',
    role: 'Founder · Lead Instructor',
    color: 'bg-[#e8f0fb] text-[#3564a1]',
  },
  {
    name: 'Sourav Maurya',
    role: 'Co-Founder · Lead Developer',
    color: 'bg-[#e8eef9] text-[#4664a0]',
  },
]

function Brand() {
  return (
    <a
      href="#top"
      aria-label="IGNOU Coders home"
      className="group inline-flex items-center gap-3"
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] transition-transform group-hover:-rotate-3">
        <img
          src="/logo.jpg"
          alt="IGNOU Coders logo"
          className="size-full object-contain"
        />
      </span>
    </a>
  )
}

function JoinLink({ children }: { children: ReactNode }) {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#168de2] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(22,113,186,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0878ca] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168de2]"
    >
      {children}
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  )
}

export function IgnouCodersLanding() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-[#172333]">
      <header className="relative z-10 border-b border-[#e1e7ef] bg-[#f6f8fb]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Brand />
          <nav
            className="flex items-center gap-2 sm:gap-8"
            aria-label="Main navigation"
          >
            <a
              href="#what-you-get"
              className="hidden text-sm font-medium text-[#526079] transition hover:text-[#245c9a] sm:inline"
            >
              What you get
            </a>
            <a
              href="#community"
              className="hidden text-sm font-medium text-[#526079] transition hover:text-[#245c9a] sm:inline"
            >
              Our people
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#d8e1ec] px-3 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#245c9a] sm:min-h-10 sm:px-4 sm:text-sm"
            >
              Sign in
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#173b62] px-3 text-xs font-semibold text-white transition hover:bg-[#245489] sm:min-h-10 sm:gap-2 sm:px-5 sm:text-sm"
            >
              Sign up <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </nav>
        </div>
      </header>

      <section
        id="top"
        className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24"
      >
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#dce6f2] bg-white/75 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#496079] shadow-sm shadow-[#2a442c]/[0.03]">
            <GraduationCap aria-hidden="true" className="size-4 text-[#2876bf]" />
            A community for IGNOU learners
          </div>
          <h1 className="max-w-2xl text-[2.9rem] font-semibold leading-[1.05] tracking-[-0.055em] text-[#172333] sm:text-6xl lg:text-[4.45rem]">
            Make room for
            <span className="mt-1 block font-serif font-medium italic text-[#1685ce]">
              what you can build.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#5e6f84] sm:text-lg sm:leading-8">
            A practical coding community for IGNOU students. Learn the
            fundamentals with recorded video classes, get helpful notes, and
            keep building at your own pace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <JoinLink>
              <MessageCircle aria-hidden="true" className="size-[18px]" />
              Sign up
            </JoinLink>
            <a
              href="#what-you-get"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-[#526079] transition hover:text-[#245c9a]"
            >
              See how it works
              <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#e2e7ef] pt-5 text-xs font-medium text-[#647083] sm:text-sm">
            {['Friendly to beginners', 'Learn together', 'Build at your pace'].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="size-4 text-[#2876bf]"
                    strokeWidth={2.5}
                  />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[510px] lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 size-40 rounded-full bg-[#cde9ff]/75 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-12 -left-12 size-44 rounded-full bg-[#dbe8fa]/80 blur-3xl"
          />
          <div className="relative rounded-[1.75rem] border border-[#dce5f1] bg-white p-2.5 shadow-[0_28px_80px_-42px_rgba(31,52,80,0.35)]">
            <div className="overflow-hidden rounded-[1.25rem] bg-[#07182b] text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#168de2] text-white">
                    <Code2 aria-hidden="true" className="size-4" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-white/85">
                    Your learning space
                  </span>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-white/55">
                  KEEP GOING
                </span>
              </div>
              <div className="px-5 py-6 sm:px-7 sm:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#71c6ff]">
                  A little progress, every day
                </p>
                <p className="mt-3 max-w-sm text-2xl font-medium leading-snug tracking-[-0.03em] text-white sm:text-[1.8rem]">
                  Your first line of code is a good place to start.
                </p>
                <div className="mt-7 rounded-xl border border-white/[0.08] bg-[#0b1220] p-4 font-mono text-xs leading-6 sm:p-5 sm:text-sm">
                  <p className="text-white/35"># try something small</p>
                  <p>
                    <span className="text-[#71c6ff]">print</span>
                    <span className="text-white/70">(</span>
                    <span className="text-[#e7bd84]">
                      &quot;Hello, future!&quot;
                    </span>
                    <span className="text-white/70">)</span>
                  </p>
                  <p className="mt-2 text-[#71c6ff]">
                    Hello, future!
                    <span className="ml-1 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[#168de2]" />
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#168de2]/15 text-[#71c6ff]">
                      <Users aria-hidden="true" className="size-4" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-white/90">
                        Better, together
                      </span>
                      <span className="mt-0.5 block text-[10px] text-white/50">
                        Ask · practise · share
                      </span>
                    </span>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-[#71c6ff]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 right-4 flex items-center gap-2 rounded-full border border-[#e1e7ef] bg-white px-4 py-2.5 text-xs font-semibold text-[#526079] shadow-lg shadow-[#263c50]/[0.07] sm:-right-5">
            <span className="size-2 rounded-full bg-[#168de2]" />
            Start where you are
          </div>
        </div>
      </section>

      <section
        id="what-you-get"
        className="border-y border-[#e1e7ef] bg-white/70"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-[#2876bf]">
                A good place to grow
              </p>
              <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#172333] sm:text-4xl">
                Learn with a little more direction.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#657186] sm:text-base">
              Small, useful steps add up. Get the structure and support to keep
              moving forward.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, number, title, description }) => (
              <article
                key={title}
                className="group rounded-2xl border border-[#e5e9ef] bg-[#fbfcff] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#c4d7ef] hover:shadow-[0_16px_36px_-28px_rgba(38,64,80,0.28)] sm:p-7"
              >
                <div className="mb-9 flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf3fb] text-[#3564a1] transition group-hover:bg-[#e1ebf8]">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-[#9aa39a]">
                    {number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#243246]">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-[#687386]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="community"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-[#2876bf]">
              People make the difference
            </p>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#172333] sm:text-4xl">
              You don&apos;t have to figure it all out alone.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-[#657186]">
              Meet the people helping make this a welcoming, hands-on space.
              Get access to recorded lessons and notes, bring your questions,
              and grow together.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#245c9a] transition hover:text-[#1685ce]"
            >
              Meet us in the community
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mentors.map(({ name, role, color }) => (
              <article
                key={name}
                className="rounded-2xl border border-[#e1e7ef] bg-white p-5 shadow-[0_10px_32px_-28px_rgba(38,64,80,0.25)] sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex size-14 items-center justify-center rounded-2xl text-sm font-bold tracking-wide ${color}`}
                    role="img"
                    aria-label="Sample profile"
                  >
                    <UserRound aria-hidden="true" className="size-7" strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-semibold tracking-[-0.02em] text-[#243246]">
                  {name}
                </h3>
                <p className="mt-1.5 text-sm text-[#687386]">{role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#0b2744] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-white/[0.08]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-16 size-56 rounded-full border border-white/[0.08]"
          />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-[#71c6ff]">
                Your next step starts here
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                Curious about coding? Come learn with us.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
                Start with a question. Find recorded lessons and practical
                notes, then keep going with the community.
              </p>
            </div>
            <JoinLink>
              <MessageCircle aria-hidden="true" className="size-[18px]" />
              Join the community
            </JoinLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e1e7ef] bg-white/65">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <Brand />
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#687386]">
                A practical coding community for curious learners and everyone
                starting their tech journey.
              </p>
            </div>
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#657066]"
            >
              <a className="transition hover:text-[#245c9a]" href="#what-you-get">
                What you get
              </a>
              <a className="transition hover:text-[#245c9a]" href="#community">
                Our people
              </a>
              <a
                className="transition hover:text-[#245c9a]"
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
              >
                Community
              </a>
              <a
                className="transition hover:text-[#245c9a]"
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
              >
                Sign in
              </a>
              <a
                className="transition hover:text-[#245c9a]"
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
              >
                Sign up
              </a>
            </nav>
          </div>
          <div className="mt-7 border-t border-[#e6eaf0] pt-5 text-xs text-[#8790a0]">
            © 2026 IGNOU Coders. Built for the journey ahead.
          </div>
        </div>
      </footer>
    </main>
  )
}
