'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { ScrollProgress } from '@/components/ui/scroll-progress';

export default function LearnPage() {
    return (
        <div className="min-h-screen bg-black text-white relative">
            <ScrollProgress className="top-0" />

            {/* Subtle background gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-black to-black pointer-events-none" />

            <Navbar />

            {/* Hero Section */}
            <header className="relative z-10 pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        Beginner's Guide
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        How to Solve a <br />
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Rubik's Cube
                        </span>
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        Master the world's most popular puzzle with this step-by-step beginner's method
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <article className="relative z-10 max-w-4xl mx-auto px-6 pb-24">

                {/* Introduction */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-6">Introduction</h2>
                    <div className="prose prose-invert prose-lg max-w-none space-y-4 text-neutral-300 leading-relaxed">
                        <p>
                            The Rubik's cube is the world's most-sold toy, and you've probably come across one.
                            You've probably picked it up and tried to play around with it too, turning the sides
                            in hopes of matching at least a few of the pieces. But solving the Rubik's cube on
                            your own without any help is a very difficult feat. It took the creator, Erno Rubik,
                            two months himself!
                        </p>
                        <p>
                            This blog aims to serve as your guide into the world of Rubik's cube solving and your
                            journey towards completing the cube.
                        </p>
                    </div>
                </section>

                {/* Video Tutorial */}
                <section className="mb-20">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/5MTyM38A7gw"
                            title="Rubik's Cube Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                        />
                    </div>
                </section>

                {/* The Basics */}
                <section id="basics" className="mb-20 scroll-mt-24">
                    <h2 className="text-3xl font-bold mb-8">The Basics</h2>

                    {/* Colors */}
                    <div className="mb-10">
                        <h3 className="text-xl font-semibold mb-4 text-blue-400">1. Colours</h3>
                        <p className="text-neutral-300 leading-relaxed">
                            The cube has 6 sides, each representing a colour - white, yellow, blue, green, orange and red.
                        </p>
                    </div>

                    {/* Pieces */}
                    <div className="mb-10">
                        <h3 className="text-xl font-semibold mb-4 text-blue-400">2. Pieces</h3>
                        <p className="text-neutral-300 mb-6">There are three types of pieces:</p>

                        <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/cube-pieces.png"
                                alt="Cube Pieces - Centers, Corners, and Edges"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain"
                                priority
                            />
                        </div>

                        <ul className="space-y-4 text-neutral-300">
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white">Centres</strong> - These remain fixed and serve as a guideline to solve the puzzle. On a solved cube, all the pieces of a particular colour surround the centre of that colour.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white">Corners</strong> - The corner pieces are located on the corners of the cube. Each piece is made up of three different colours. There are 8 corners on the Rubik's cube.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white">Edges</strong> - The edges are the pieces between two corners. They are made up of two colours. There are 12 edges on the Rubik's cube.
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Notation */}
                    <div className="mb-10">
                        <h3 className="text-xl font-semibold mb-4 text-blue-400">3. Notation</h3>

                        <div className="relative w-full aspect-[2.5/1] mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/rubik-guide.png"
                                alt="Rubik's Cube Notation"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain p-4"
                            />
                        </div>

                        <p className="text-neutral-300 mb-4">The notation describes the movement of each layer:</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { move: 'R', desc: 'Right clockwise' },
                                { move: "R'", desc: 'Right counter-clockwise' },
                                { move: 'L', desc: 'Left clockwise' },
                                { move: "L'", desc: 'Left counter-clockwise' },
                                { move: 'U', desc: 'Upper clockwise' },
                                { move: "U'", desc: 'Upper counter-clockwise' },
                                { move: 'F', desc: 'Front clockwise' },
                                { move: "F'", desc: 'Front counter-clockwise' },
                            ].map(({ move, desc }) => (
                                <div key={move} className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                                    <code className="text-blue-400 font-bold text-lg">{move}</code>
                                    <p className="text-neutral-500 text-sm mt-1">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How is Cube Solved */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-6">How is the Cube Solved?</h2>

                    <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden bg-white">
                        <Image
                            src="/assets/learn/cube-layers.png"
                            alt="Cube Layers"
                            fill
                            sizes="(max-width: 896px) 100vw, 896px"
                            className="object-contain"
                        />
                    </div>

                    <div className="space-y-4 text-neutral-300 leading-relaxed mb-6">
                        <p>
                            A common misconception is that the cube is solved one colour at a time. This is simply
                            not possible because of the nature of the pieces and the design of the cube. Instead,
                            we approach the cube <strong className="text-white">layer by layer</strong>. The bottom
                            layer is solved first, the middle layer next and the last layer towards the end, building
                            the layer up on the previous one.
                        </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                        <h3 className="font-semibold text-white mb-4">The method is divided into 3 main steps:</h3>
                        <ol className="space-y-2 text-neutral-300">
                            <li><strong className="text-white">Step 1:</strong> First Layer - White cross and white corners</li>
                            <li><strong className="text-white">Step 2:</strong> Second Layer - Non-yellow edges</li>
                            <li><strong className="text-white">Step 3:</strong> Last Layer - Yellow cross, corners, and final positioning</li>
                        </ol>
                    </div>
                </section>

                {/* Progression Banner */}
                <div className="relative w-full aspect-[2.5/1.7] mb-20 rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900  to-neutral-800 border border-neutral-800">
                    <h2 className="text-5xl font-bold text-white p-6">Solving Progression</h2>
                    <Image
                        src="/assets/learn/solve-progression.png"
                        alt="Solving Progression"
                        fill
                        sizes="(max-width: 896px) 100vw, 896px"
                        className="object-contain p-6 pt-20"
                    />
                </div>

                {/* Step 1: First Layer */}
                <section id="step1" className="mb-20 scroll-mt-24">
                    <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-4">
                        Step 1
                    </div>
                    <h2 className="text-3xl font-bold mb-8">First Layer</h2>

                    {/* White Cross */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-white">White Cross</h3>
                        <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/white-cross.png"
                                alt="White Cross"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain"
                            />
                        </div>
                        <div className="space-y-3 text-neutral-300 mb-6">
                            <p>The cross is commonly started off on white. The steps to solve the cross are:</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Locate any white edge on your cube and identify the non-white part of the edge</li>
                                <li>Match the non-white part to its own centre by hit and trial (2-3 moves)</li>
                                <li>Once the piece has matched its centre, rotate the piece so that the white part matches the white centre as well</li>
                                <li>Repeat this process for the other white edges until you end up with a white cross</li>
                            </ol>
                        </div>
                    </div>

                    {/* White Corners */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-white">White Corners</h3>

                        <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/white-corners.png"
                                alt="White Corners Algorithm"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain"
                            />
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                            <p className="text-neutral-400 mb-2">Algorithm:</p>
                            <code className="text-2xl font-bold text-blue-400">R U R' U'</code>
                        </div>

                        <div className="space-y-3 text-neutral-300">
                            <p>Before moving on, try performing this sequence of moves on your cube - R U R' U'. You have just learnt your very first algorithm!</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Position your cube so that the white centre is at the bottom</li>
                                <li>Locate a white corner in the top layer</li>
                                <li>Move the top layer until the white corner ends up between the corresponding centres of the non-white parts</li>
                                <li>Perform the algorithm R U R' U' until the white corner is correctly solved</li>
                                <li>Repeat for all white corners</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Step 2: Second Layer */}
                <section id="step2" className="mb-20 scroll-mt-24">
                    <div className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium mb-4">
                        Step 2
                    </div>
                    <h2 className="text-3xl font-bold mb-8">Second Layer</h2>

                    <h3 className="text-2xl font-semibold mb-4 text-white">Non-Yellow Edges</h3>

                    <div className="space-y-4 mb-6">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <p className="text-neutral-400 mb-2">Centre on Right:</p>
                            <code className="text-lg font-bold text-cyan-400">U R U' R' U' F' U F</code>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <p className="text-neutral-400 mb-2">Centre on Left:</p>
                            <code className="text-lg font-bold text-cyan-400">U' L' U L U F U' F'</code>
                        </div>
                    </div>

                    <div className="space-y-3 text-neutral-300 mb-8">
                        <p>The second layer works on the positioning of non-yellow edges:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Locate a non-yellow edge</li>
                            <li>Identify the part of the edge in front of you and match it with the centre of the same colour by turning the top layer</li>
                            <li>Identify the part of the edge connected to the yellow centre and locate the corresponding centre</li>
                            <li>If the centre is on the right side, use the first algorithm. If not, use the second algorithm</li>
                        </ol>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                        <p className="text-cyan-400 font-semibold mb-4">After completing all second layer edges:</p>
                        <div className="relative w-full aspect-video mx-auto rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/second-layer-result.png"
                                alt="Second Layer Result"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain"
                            />
                        </div>
                    </div>
                </section>

                {/* Step 3: Last Layer */}
                <section id="step3" className="mb-20 scroll-mt-24">
                    <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-4">
                        Step 3
                    </div>
                    <h2 className="text-3xl font-bold mb-8">Last Layer</h2>

                    {/* Last Layer Start */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-10">
                        <p className="text-amber-400 font-semibold mb-4">Starting Point:</p>
                        <div className="relative w-full aspect-video mx-auto rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/second-layer-result.png"
                                alt="Last Layer Starting State"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Yellow Cross */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-white">1. Yellow Cross</h3>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                            <p className="text-neutral-400 mb-2">Algorithm:</p>
                            <code className="text-2xl font-bold text-amber-400">F R U R' U' F'</code>
                        </div>

                        <div className="relative w-full aspect-[2/1] mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/yellow-cross-detailed.png"
                                alt="Yellow Cross Guide"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain p-2"
                            />
                        </div>

                        <p className="text-neutral-300">
                            The yellow cross can be divided into three cases. The algorithm used for each case is the same,
                            however, the initial positions vary. Identify the case on your cube and position it according to
                            the corresponding position in the image. Simply repeat the algorithm until the cross is solved.
                        </p>
                    </div>

                    {/* Positioning Edges */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-white">2. Positioning Last Layer Edges</h3>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                            <p className="text-neutral-400 mb-2">Algorithm:</p>
                            <code className="text-2xl font-bold text-amber-400">R U R' U R U2 R'</code>
                        </div>

                        <div className="relative w-full aspect-[2/1] mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/edge-permutation.png"
                                alt="Edge Permutation"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain p-2"
                            />
                        </div>

                        <p className="text-neutral-300">
                            Match any one edge of the top layer with its centre in the middle layer. Now, repeat the
                            algorithm until all edges match their centres.
                        </p>
                    </div>

                    {/* Positioning Corners */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-white">3. Last Layer Corners</h3>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                            <p className="text-neutral-400 mb-2">Algorithm:</p>
                            <code className="text-2xl font-bold text-amber-400">U R U' L' U R' U' L</code>
                        </div>

                        <div className="relative w-full aspect-[2/1] mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/corner-orientation-guide.png"
                                alt="Corner Permutation"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain p-2"
                            />
                        </div>

                        <p className="text-neutral-300">
                            Find a corner that is already matched and keep it towards the front-right of the cube.
                            If none of the corner pieces is in the right place, you can hold the cube in any orientation
                            with the unmatched pieces on top and apply the algorithm.
                        </p>
                    </div>

                    {/* Orienting Corners */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-white">4. Top Layer Corners</h3>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                            <p className="text-neutral-400 mb-2">Algorithm:</p>
                            <code className="text-2xl font-bold text-amber-400">R' D' R D</code>
                        </div>

                        <div className="relative w-full aspect-[2/1] mb-6 rounded-xl overflow-hidden bg-white">
                            <Image
                                src="/assets/learn/solved-cube.png"
                                alt="Corner Orientation"
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain p-2"
                            />
                        </div>

                        <p className="text-neutral-300">
                            Keep the yellow side on top and the corner which is not aligned on the front right corner.
                            Use the algorithm till the corner is aligned, then rotate the top layer and bring the unaligned
                            corner to the front right corner and apply the algorithm again. Repeat until all corners are solved.
                        </p>
                    </div>

                    {/* Success Message */}
                    <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                        <p className="text-neutral-300">
                            You've solved the cube! While the first-time solving is confusing, remember that you get
                            better with each solve. It typically takes at least 5-10 solves to get comfortable with a
                            new method, so keep practising.
                        </p>
                    </div>
                </section>

                {/* Author */}
                <section className="mb-12 pt-12 border-t border-neutral-800">
                    <h3 className="text-2xl font-bold mb-6">About the Author</h3>
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Profile Image */}
                            <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                                <Image
                                    src="/assets/learn/profile-img.png"
                                    alt="Shaik Junaid Sami"
                                    fill
                                    sizes="128px"
                                    className="object-cover rounded-full ring-4 ring-blue-500/20"
                                />
                            </div>

                            {/* Author Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h4 className="text-2xl font-bold text-white mb-1">Shaik Junaid Sami</h4>
                                    <p className="text-neutral-400 text-sm mb-2">Newton School • Second Year Student</p>
                                    <a
                                        href="https://theshaik.tech"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                                    >
                                        <span>🔗</span>
                                        <span>Portfolio</span>
                                    </a>
                                </div>

                                <p className="text-neutral-300 leading-relaxed">
                                    Aspiring Full Stack Developer and AI Developer skilled in building scalable web applications
                                    using JavaScript frameworks. Strong problem-solving foundation with 400+ LeetCode problems solved
                                    and a 900+ Codeforces rating. Driven by curiosity and a desire to build impactful systems,
                                    committed to clean architecture and reliable engineering practices, with a focus on delivering
                                    products that boost performance, enhance user experience, and support long-term team and business goals.
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                                        Full Stack Dev
                                    </span>
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                                        AI Developer
                                    </span>
                                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                                        400+ LeetCode
                                    </span>
                                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm">
                                        900+ Codeforces
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-10 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Solve Your Cube?</h3>
                    <p className="text-neutral-400 mb-6">Use our interactive solver to get step-by-step solutions</p>
                    <a
                        href="/solver"
                        className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Try Our Solver
                    </a>
                </div>
            </article>
        </div>
    );
}
