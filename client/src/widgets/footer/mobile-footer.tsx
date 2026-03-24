const CONTACT_EMAIL = "saintaslanboutique@gmail.com";
const MAILTO_HREF = `mailto:${CONTACT_EMAIL}`;

export default function MobileFooter() {
    return (
        <footer
            aria-label="Site footer"
            className="flex w-full flex-col overflow-hidden bg-[#1c1d1d] pt-6 text-white"
        >
            <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <section aria-labelledby="mobile-footer-get-in-touch-heading" className="flex shrink-0 flex-col gap-4">
                    <h3
                        id="mobile-footer-get-in-touch-heading"
                        className="text-nowrap text-2xl font-medium tracking-tight text-white sm:text-3xl"
                    >
                        Get in touch
                    </h3>

                    <div className="flex flex-col gap-2">
                        <a
                            href={MAILTO_HREF}
                            className="flex min-h-[48px] w-full touch-manipulation flex-col justify-center rounded-sm border border-white/20 bg-white px-4 py-4 text-left text-base font-medium leading-snug text-black outline-none transition-colors hover:text-zinc-600 active:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1d1d] sm:py-5 sm:text-lg"
                        >
                            <span className="sr-only">Email: </span>
                            <span className="wrap-break-word">{CONTACT_EMAIL}</span>
                        </a>
                        <p className="text-sm text-white/50">Tap to open your email app</p>
                    </div>
                </section>
            </div>
        </footer>
    );
}
