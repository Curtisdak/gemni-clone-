"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Brain,
  MessageCircle,
  Zap,
  Bot,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const featureCards = [
  {
    icon: Sparkles,
    title: "Creative intelligence",
    description:
      "Brainstorm vivid concepts, craft narratives, or design brand identities with an assistant fluent in imagination.",
  },
  {
    icon: Shield,
    title: "Private by default",
    description:
      "Enterprise-grade controls keep every chat encrypted at rest and limit access to you and invited teammates.",
  },
  {
    icon: Brain,
    title: "Context aware",
    description:
      "Curtis Gemini remembers nuance across conversations so every follow-up feels instant and personal.",
  },
];

const workflowSteps = [
  {
    title: "Start with a spark",
    body: "Drop in a prompt or ask Curtis Gemini to suggest directions based on your current project files.",
  },
  {
    title: "Iterate in real time",
    body: "Blend structured tools, custom style guides, and visual inspiration in a single collaborative thread.",
  },
  {
    title: "Deliver with confidence",
    body: "Export polished summaries, creative briefs, or ready-to-ship assets without leaving the workspace.",
  },
];

const testimonialCards = [
  {
    name: "Maya Henderson",
    role: "Head of Product Design",
    quote:
      "Curtis Gemini has become our studio's creative co-pilot. The prompts feel alive and the context hand-off between teammates is effortless.",
  },
  {
    name: "Leo Martins",
    role: "AI Researcher",
    quote:
      "From code review to exploratory research, Gemini delivers answers with citations in seconds. It truly understands our domain language.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-black dark:text-white">
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute -top-48 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/25" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[560px] w-[560px] rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-500/30" />
      </motion.div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
            <Bot className="h-5 w-5 text-sky-500 dark:text-sky-300" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">
            Curtis Gemini
          </span>
        </motion.div>

        <motion.nav
          className="hidden items-center gap-6 text-sm text-slate-500 transition-colors md:flex dark:text-slate-300"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Link
            className="transition text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="transition text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            href="#workflow"
          >
            Workflow
          </Link>
          <Link
            className="transition text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            href="#stories"
          >
            Stories
          </Link>
          <Link
            className="transition text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            href="/chat"
          >
            Product
          </Link>
        </motion.nav>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button
            asChild
            className="bg-sky-500 text-sm font-semibold text-slate-900 hover:bg-sky-400"
          >
            <Link href="/signup">
              Get started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-32">
        <section className="grid gap-12 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-sky-300" />
              The next wave of creative AI
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-6xl">
              Where ambitious teams prototype the future in minutes.
            </h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Curtis Gemini blends multimodal reasoning, memory, and real-time
              collaboration so you can sketch, iterate, and deliver ideas that
              feel handcrafted for your audience without leaving the canvas.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 gap-2 rounded-full bg-white text-base font-semibold text-slate-900 hover:bg-slate-200"
              >
                <Link href="/chat">
                  Launch Curtis Gemini
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 gap-2 rounded-full border-slate-300 text-base text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                <Link href="#features">See what is new</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-sky-400/20 via-blue-300/10 to-transparent blur-2xl dark:from-sky-500/30 dark:via-blue-400/10" />
            <Card className="relative overflow-hidden border border-slate-200 bg-white backdrop-blur dark:border-white/10 dark:bg-white/10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-6 p-8"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-200">
                    Live conversation
                  </p>
                  <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
                    Realtime
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
                    <p className="font-medium text-foreground dark:text-white">
                      "Compose a launch announcement that highlights the feeling
                      of human and AI co-creation."
                    </p>
                  </div>
                  <motion.div
                    className="rounded-2xl bg-white p-4 text-sm text-slate-900 shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <p>
                      Absolutely. I will weave in language that celebrates how
                      people steer the creative direction while Curtis Gemini
                      accelerates craft and storytelling. Want a section that
                      highlights your early adopters?
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      Responding in real time...
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </section>

        <section id="features" className="space-y-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-300">
              Capabilities
            </p>
            <div className="md:flex md:items-end md:justify-between">
              <h2 className="max-w-2xl text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
                Designed for teams who expect more than generic answers.
              </h2>
              <p className="mt-3 max-w-md text-sm text-slate-600 md:text-right md:leading-relaxed dark:text-slate-300">
                Curtis Gemini unifies language, image, and code generation,
                tuned to reflect your brand voice and data privacy standards.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="grid h-full gap-4 border border-slate-200 bg-white p-6 backdrop-blur transition-colors dark:border-white/10 dark:bg-white/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sky-600 dark:bg-white/10 dark:text-sky-200">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="workflow" className="grid gap-12 md:grid-cols-[1fr_1fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-300">
              Workflow
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
              A single canvas for ideation, synthesis, and launch.
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Mix conversational prompts, structured command palettes, and
              embedded assets. Curtis Gemini adapts to your flow, not the other
              way around.
            </p>
            <Button
              asChild
              className="mt-6 w-fit rounded-full bg-slate-900 text-sm text-white hover:bg-slate-700 dark:bg-white/10 dark:hover:bg-white/20"
            >
              <Link href="/signup">
                Try the Curtis Gemini workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            {workflowSteps.map((step, index) => (
              <Card
                key={step.title}
                className="border border-slate-200 bg-slate-100 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sm font-semibold text-sky-600 dark:bg-sky-500/15 dark:text-sky-200">
                    {index + 1}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </section>

        <section
          id="stories"
          className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center"
        >
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-300">
              Testimonials
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
              Trusted by product visionaries, researchers, and storytellers.
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Teams across design, marketing, and research rely on Curtis Gemini
              to dissolve blockers, explore new directions, and present sharper
              insights without sacrificing governance.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            {testimonialCards.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="border border-slate-200 bg-white p-6 backdrop-blur transition-colors dark:border-white/10 dark:bg-white/10"
              >
                <div className="flex items-center gap-3 text-sm text-sky-600 dark:text-sky-200">
                  <MessageCircle className="h-5 w-5" />
                  <span>Case Study #{index + 1}</span>
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-100">
                  "{testimonial.quote}"
                </p>
                <p className="mt-6 text-sm font-semibold text-slate-900 dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {testimonial.role}
                </p>
              </Card>
            ))}
          </motion.div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-sky-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto flex max-w-3xl flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              <Zap className="h-4 w-4 text-sky-500 dark:text-sky-200" />
              Instant access
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
              Ready to co-create with a tireless partner?
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Curtis Gemini is free for individuals getting started. Scale with
              advanced compliance, granular analytics, and team orchestration as
              you grow.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-11 rounded-full bg-white text-base font-semibold text-slate-900 hover:bg-slate-200"
              >
                <Link href="/signup">
                  Create your workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-slate-300 text-base text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                <Link href="/signin">Sign in</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/80 bg-background/80 transition-colors dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-slate-600 md:flex-row dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Wand2 className="h-4 w-4" />
            <span>Copyright {new Date().getFullYear()} Curtis Gemini Labs</span>
          </div>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            <Link
              className="transition hover:text-slate-900 dark:hover:text-white"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="transition hover:text-slate-900 dark:hover:text-white"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="transition hover:text-slate-900 dark:hover:text-white"
              href="/chat"
            >
              Launch app
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
