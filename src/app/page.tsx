import { Button } from "@/components/ui/Button";
import {
  IconArrowRight,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandX,
} from "@tabler/icons-react";
import { File, Globe, Monitor } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <>
      <div className="flex flex-col h-[calc(100vh-5rem)] items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="p-2 border rounded-full">
            <p className="p-2 text-sm">
              BuildLedger is now in public beta!{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </div>
          <h1 className="text-5xl font-bold text-center mt-4">
            A new way to build <br /> your ledger
          </h1>
          <p className="text-xl text-center mt-4">
            BuildLedger is a modern, open-source accounting software <br />{" "}
            that helps you manage your finances with ease.
          </p>
          <div className="flex items-center justify-center mt-4">
            <Link href="/signup">
              <Button>
                Get Started <IconArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <section className="flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold text-center">
          Beautifully designed, easy to use
        </h2>
        <p className="text-xl text-center mt-4">
          BuildLedger is designed to be intuitive and easy to use. <br /> No
          more complicated software, just a simple and beautiful interface.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 border rounded-md">
            <Monitor className="w-8 h-8" />
            <h3 className="text-xl font-bold mt-2">Modern Interface</h3>
            <p className="mt-2">
              A clean and modern interface that is easy to use and navigate.
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <File className="w-8 h-8" />
            <h3 className="text-xl font-bold mt-2">Invoices & Quotes</h3>
            <p className="mt-2">
              Create and manage invoices and quotes with ease.
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <Globe className="w-8 h-8" />
            <h3 className="text-xl font-bold mt-2">Client Management</h3>
            <p className="mt-2">
              Manage your clients and their information in one place.
            </p>
          </div>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center mt-8">
        <h2 className="text-4xl font-bold text-center">
          Trusted by thousands of businesses
        </h2>
        <p className="text-xl text-center mt-4">
          BuildLedger is trusted by thousands of businesses worldwide.
        </p>
        <div className="flex items-center justify-center mt-8">
          <div className="p-4 border rounded-md">
            <Image
              src="/_next/image?url=%2F..%2F..%2F..%2F..%2F..%2F..%2Ftmp%2F-1721997097960.png&w=128&q=75"
              alt="Client 1"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div className="p-4 border rounded-md">
            <Image
              src="/_next/image?url=%2F..%2F..%2F..%2F..%2F..%2F..%2Ftmp%2F-1721997097960.png&w=128&q=75"
              alt="Client 2"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div className="p-4 border rounded-md">
            <Image
              src="/_next/image?url=%2F..%2F..%2F..%2F..%2F..%2F..%2Ftmp%2F-1721997097960.png&w=128&q=75"
              alt="Client 3"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        </div>
      </section>
      <footer className="flex flex-col items-center justify-center mt-8">
        <div className="flex items-center justify-center">
          <Link href="https://x.com/buildledger" target="_blank">
            <IconBrandX />
          </Link>
          <Link href="https://github.com/buildledger/buildledger" target="_blank">
            <IconBrandGithub />
          </Link>
          <Link href="https://google.com/buildledger" target="_blank">
            <IconBrandGoogle />
          </Link>
        </div>
        <p className="mt-4">
          © {new Date().getFullYear()} BuildLedger. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default Home; 