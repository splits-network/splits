"use client";

import Link from "next/link";

export function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
                <nav>
                    <div className="flex items-center gap-2 mb-2">
                        <img
                            src="/logo.svg"
                            alt="Employment Networks"
                            className="h-14"
                        />
                    </div>
                    <p className="max-w-xs text-base-content/70">
                        Building the future of recruiting and employment through
                        innovative platforms.
                    </p>
                </nav>
                <nav>
                    <h6 className="footer-title">Products</h6>
                    <a
                        href="https://splits.network"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-hover"
                    >
                        Splits Network
                    </a>
                    <a
                        href="https://applicant.network"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-hover"
                    >
                        Applicant Network
                    </a>
                    <Link href="#products" className="link link-hover">
                        View All
                    </Link>
                </nav>
                <nav>
                    <h6 className="footer-title">Company</h6>
                    <Link href="#about" className="link link-hover">
                        About Us
                    </Link>
                    <Link href="/contact" className="link link-hover">
                        Contact
                    </Link>
                    <Link href="/status" className="link link-hover">
                        System Status
                    </Link>
                </nav>
                <nav>
                    <h6 className="footer-title">Legal</h6>
                    <Link href="/privacy-policy" className="link link-hover">
                        Privacy Policy
                    </Link>
                    <Link href="/terms-of-service" className="link link-hover">
                        Terms of Service
                    </Link>
                    <Link href="/cookie-policy" className="link link-hover">
                        Cookie Policy
                    </Link>
                </nav>
            </footer>
            <footer className="footer footer-center p-4 bg-base-200 text-base-content border-t border-base-300">
                <aside>
                    <p>
                        Copyright © {new Date().getFullYear()} Employment
                        Networks, Inc. All rights reserved.
                    </p>
                </aside>
                <nav>
                    <div className="grid grid-flow-col gap-4">
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                        >
                            <i className="fa-brands fa-twitter text-xl"></i>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                        >
                            <i className="fa-brands fa-linkedin text-xl"></i>
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <i className="fa-brands fa-facebook text-xl"></i>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <i className="fa-brands fa-instagram text-xl"></i>
                        </a>
                    </div>
                </nav>
            </footer>
        </>
    );
}
