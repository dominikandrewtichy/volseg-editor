import drosophila from "@/assets/examples/drosophila.png";
import murine from "@/assets/examples/murine.png";
import reinhardtii from "@/assets/examples/reinhardtii.png";
import einfraDark from "@/assets/icons/github-dark.svg";
import einfraLight from "@/assets/icons/github-light.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoveRightIcon } from "lucide-react";
import { useNavigate } from "react-router";

export function HomePage() {
  const navigate = useNavigate();

  const examples = [
    {
      share_link: "22222222-2222-2222-a222-222222222222",
      title: "Drosophila melanogaster CMG complex bound to ADP.BeF3",
      image: drosophila,
    },
    {
      share_link: "33333333-3333-3333-a333-333333333333",
      title:
        "Focused Ion Beam-Scanning Electron Microscopy of mitochondrial reticulum in murine skeletal muscle.",
      image: murine,
    },
    {
      share_link: "44444444-4444-4444-a444-444444444444",
      title: "In situ cryo-ET dataset of Chlamydomonas reinhardtii",
      image: reinhardtii,
    },
  ];

  return (
    <div className="space-y-24 mb-24">
      <section className="text-center space-y-6 mt-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Volseg Editor
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Upload, visualize, and share your volumetric and segmentation data.
        </p>
        <div className="flex flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate("/dashboard")}
          >
            Go to App
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              window.open(
                "https://github.com/dominikandrewtichy/volseg-editor",
                "_blank",
              )
            }
          >
            <img
              src={einfraLight}
              alt="github logo"
              className="block dark:hidden size-4 object-contain mr-2"
            />
            <img
              src={einfraDark}
              alt="github logo"
              className="hidden dark:block size-4 object-contain mr-2"
            />
            GitHub
          </Button>
        </div>
      </section>

      <section className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {examples.map((example) => (
            <Card
              key={example.share_link}
              className="group hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full overflow-hidden"
              onClick={() => navigate(`/share/${example.share_link}`)}
            >
              <div className="relative w-full aspect-video bg-muted">
                <img
                  src={example.image}
                  alt={example.title}
                  className="object-cover w-full h-full"
                />
              </div>

              <CardHeader>
                <CardTitle className="leading-tight text-lg">
                  {example.title}
                </CardTitle>
              </CardHeader>

              <CardContent></CardContent>

              <CardFooter className="pt-0 text-xs flex items-center gap-2 text-muted-foreground mt-auto">
                Click to view details
                <MoveRightIcon className="size-4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
