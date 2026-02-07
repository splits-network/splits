"use client";

import { ReactNode } from "react";
import { DemoModeProvider } from "../../../lib/demo/demo-context";
import { Header } from "./components/header";
import { Footer } from "@/components/footer";

export default function DemoLayout({ children }: { children: ReactNode }) {
    return (
        <DemoModeProvider>
            <div className="bg-base-100">
                <div className="container mx-auto px-4 py-6">
                    <div className="alert alert-info mb-6">
                        <i className="fa-duotone fa-regular fa-info-circle" />
                        <span>
                            This is a demo environment. Data is reset
                            periodically. Do not use real data here.
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">
                        Demo Environment
                    </h1>
                    <p className="text-base-content/70 mb-4">
                        Explore the features of the Splits Network portal with
                        mock data. This environment is intended for testing and
                        demonstration purposes. Data is reset periodically, so
                        please do not use real or sensitive information here.
                    </p>
                </div>
                <div className="relative max-w-5xl mx-auto min-h-screen flex flex-col overflow-hidden bg-base-200">
                    <Header />
                    {children}
                    <Footer />
                </div>
            </div>
        </DemoModeProvider>
    );
}
