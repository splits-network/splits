import Link from "next/link";

const SHOWCASE_CATEGORIES: {
	label: string;
	pages: { title: string; slug: string; description: string; icon: string; href: string }[];
}[] = [
	{
		label: "Layout & Navigation",
		pages: [
			{ title: "Headers", slug: "headers", description: "Navigation bars, mega menus, mobile", icon: "fa-browser", href: "/showcase/headers/one" },
			{ title: "Footers", slug: "footers", description: "Site footers, link columns, newsletters", icon: "fa-rectangle-wide", href: "/showcase/footers/one" },
		],
	},
	{
		label: "Data Display",
		pages: [
			{ title: "Dashboards", slug: "dashboards", description: "Analytics, KPIs, chart grids", icon: "fa-gauge-high", href: "/showcase/dashboards/one" },
			{ title: "Tables", slug: "tables", description: "Data tables, sortable columns", icon: "fa-table", href: "/showcase/tables/one" },
			{ title: "Cards", slug: "cards", description: "Card grids, stat cards, feature cards", icon: "fa-cards-blank", href: "/showcase/cards/one" },
			{ title: "Details", slug: "details", description: "Single-record views, entity profiles", icon: "fa-file-lines", href: "/showcase/details/one" },
			{ title: "Profiles", slug: "profiles", description: "User profiles, avatar layouts", icon: "fa-user", href: "/showcase/profiles/one" },
			{ title: "Lists", slug: "lists", description: "List views, browse layouts, split panes", icon: "fa-list", href: "/showcase/lists/one" },
		],
	},
	{
		label: "Forms & Input",
		pages: [
			{ title: "Forms", slug: "forms", description: "Input forms, wizards, validation", icon: "fa-input-text", href: "/showcase/forms/one" },
			{ title: "Search", slug: "search", description: "Search results, autocomplete", icon: "fa-magnifying-glass", href: "/showcase/search/one" },
			{ title: "Modals", slug: "modals", description: "Dialogs, confirmations, drawers", icon: "fa-window-maximize", href: "/showcase/modals/one" },
		],
	},
	{
		label: "Content",
		pages: [
			{ title: "Landing Pages", slug: "landing", description: "Hero sections, CTAs, marketing", icon: "fa-rocket-launch", href: "/showcase/landing/one" },
			{ title: "Articles", slug: "articles", description: "Blog posts, long-form content", icon: "fa-newspaper", href: "/showcase/articles/one" },
			{ title: "Pricing", slug: "pricing", description: "Pricing tables, plan comparisons", icon: "fa-tags", href: "/showcase/pricing/one" },
		],
	},
	{
		label: "Communication",
		pages: [
			{ title: "Messages", slug: "messages", description: "Chat interfaces, threads", icon: "fa-comments", href: "/showcase/messages/one" },
			{ title: "Notifications", slug: "notifications", description: "Notification feeds, alerts", icon: "fa-bell", href: "/showcase/notifications/one" },
		],
	},
	{
		label: "Flows & States",
		pages: [
			{ title: "Auth", slug: "auth", description: "Login, signup, verification", icon: "fa-lock", href: "/showcase/auth/one" },
			{ title: "Onboarding", slug: "onboarding", description: "Welcome flows, setup wizards", icon: "fa-flag-checkered", href: "/showcase/onboarding/one" },
			{ title: "Empty States", slug: "empty", description: "Zero-data views, placeholders", icon: "fa-ghost", href: "/showcase/empty/one" },
			{ title: "Settings", slug: "settings", description: "Preference panels, toggles", icon: "fa-gear", href: "/showcase/settings/one" },
		],
	},
];

const SECTION_ACCENTS = ["primary", "secondary", "accent", "info", "success", "warning"] as const;

export default function ShowcaseIndexPage() {
	const totalPages = SHOWCASE_CATEGORIES.reduce((sum, s) => sum + s.pages.length, 0);

	return (
		<div className="min-h-screen bg-base-100">
			{/* Hero */}
			<div className="relative overflow-hidden border-b border-base-300">
				<div
					className="absolute inset-0 bg-primary/5"
					style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 100%)" }}
				/>
				<div className="relative max-w-6xl mx-auto px-8 py-16">
					<p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
						Designer One
					</p>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-base-content mb-3">
						Basel Design System
					</h1>
					<p className="text-sm text-base-content/50 max-w-md mb-6">
						The definitive reference for every component and pattern in the Basel editorial design language.
					</p>
					<span className="text-xs font-medium text-base-content/30">
						{totalPages} component showcases
					</span>
				</div>
			</div>

			{/* Categories */}
			<div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
				{SHOWCASE_CATEGORIES.map((section, sectionIdx) => {
					const accent = SECTION_ACCENTS[sectionIdx % SECTION_ACCENTS.length];
					return (
						<div key={section.label}>
							<div className="flex items-center gap-3 mb-5">
								<span className={`badge badge-${accent} badge-sm font-semibold uppercase tracking-wider`}>
									{section.label}
								</span>
								<div className="flex-1 h-px bg-base-300" />
							</div>

							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
								{section.pages.map((page) => (
									<Link
										key={page.slug}
										href={page.href}
										className="group card card-border border-base-300 hover:border-primary/40 transition-all hover:-translate-y-0.5"
									>
										<div className="card-body p-4 gap-1.5">
											<div className="flex items-center gap-2">
												<i className={`fa-duotone fa-regular ${page.icon} text-xs text-primary`} />
												<span className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors">
													{page.title}
												</span>
											</div>
											<p className="text-xs text-base-content/40 leading-relaxed">
												{page.description}
											</p>
										</div>
									</Link>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
