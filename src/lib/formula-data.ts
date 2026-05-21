export interface Formula {
  id: string;
  name: string;
  category: string;
  latex: string;
  description: string;
  variables: Record<string, string>;
}

export const formulas: Formula[] = [
  // === KRYPTOGRAPHIE ===
  {
    id: "ecdsa-pubkey",
    name: "ECDSA Public Key",
    category: "Kryptographie",
    latex: "Q = d · G",
    description: "Public Key Q ist das Produkt aus Private Key d und Generator G auf secp256k1",
    variables: { "Q": "Public Key", "d": "Private Key", "G": "Generator" }
  },
  {
    id: "ecdsa-inversion",
    name: "ECDSA Inversion",
    category: "Kryptographie",
    latex: "d = k · r⁻¹ mod N",
    description: "Private Key Berechnung aus Signatur-Komponenten (Nonce Reuse)",
    variables: { "d": "Private Key", "k": "Ephemeral Key", "r": "Signatur R", "N": "Kurvenordnung" }
  },
  {
    id: "ecdsa-signature",
    name: "ECDSA Signatur",
    category: "Kryptographie",
    latex: "s = k⁻¹ · (z + r·d) mod N",
    description: "Berechnung des S-Werts einer ECDSA-Signatur",
    variables: { "s": "Signatur S", "k": "Nonce", "z": "Message Hash", "r": "Signatur R", "d": "Private Key" }
  },
  {
    id: "sha256-hash",
    name: "SHA-256 Doppelhash",
    category: "Kryptographie",
    latex: "H(B) = SHA256(SHA256(B))",
    description: "Bitcoin Block-Hash Funktion",
    variables: { "B": "Block-Daten", "H": "Hash" }
  },
  {
    id: "modular-inverse",
    name: "Modulare Inverse",
    category: "Kryptographie",
    latex: "a⁻¹ mod N mit a·a⁻¹ ≡ 1 (mod N)",
    description: "Extended Euclidean Algorithm für modulare Inverse",
    variables: { "a": "Eingabe", "N": "Modulus" }
  },

  // === SAT-LOGIK ===
  {
    id: "cnf-formula",
    name: "CNF Formel",
    category: "SAT-Logik",
    latex: "CNF = ⋀ᵢ₌₁ᵐ Cᵢ, Cᵢ = ⋁ⱼ₌₁ᵏ lᵢⱼ",
    description: "Konjunktive Normalform - AND von OR-Klauseln",
    variables: { "Cᵢ": "Klausel i", "lᵢⱼ": "Literal j", "m": "Klauselanzahl" }
  },
  {
    id: "resolution",
    name: "Resolution",
    category: "SAT-Logik",
    latex: "(A ∨ x) ∧ (B ∨ ¬x) ⇒ (A ∨ B)",
    description: "Resolutionsregel - eliminiert Variable x",
    variables: { "A, B": "Literalmengen", "x": "Variable" }
  },
  {
    id: "unit-propagation",
    name: "Unit Propagation",
    category: "SAT-Logik",
    latex: "C = {l} ⇒ l := true",
    description: "Wenn Klausel nur ein Literal hat, muss es wahr sein",
    variables: { "C": "Unit-Klausel", "l": "Literal" }
  },
  {
    id: "dpll",
    name: "DPLL Algorithmus",
    category: "SAT-Logik",
    latex: "DPLL(φ) = UP(φ) ∧ (DPLL(φ[x]) ∨ DPLL(φ[¬x]))",
    description: "Davis-Putnam-Logemann-Loveland mit Backtracking",
    variables: { "φ": "CNF-Formel", "UP": "Unit Propagation", "x": "Splitting-Variable" }
  },

  // === DYNAMIK ===
  {
    id: "dynamisches-system",
    name: "Diskretes Dynamisches System",
    category: "Dynamik",
    latex: "Fⁿ := F ∘ F ∘ ... ∘ F (n-mal)",
    description: "n-te Iterierte einer Selbstabbildung F",
    variables: { "F": "Abbildung", "n": "Iterationstiefe" }
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "Dynamik",
    latex: "O(x) = {Fⁿ(x) | n ∈ ℕ₀}",
    description: "Menge aller Iterationen eines Punktes x",
    variables: { "x": "Startpunkt", "Fⁿ(x)": "n-te Iteration" }
  },
  {
    id: "fixpunkt",
    name: "Fixpunkt",
    category: "Dynamik",
    latex: "x* ∈ S mit F(x*) = x*",
    description: "Punkt der unter F invariant bleibt",
    variables: { "x*": "Fixpunkt", "F": "Abbildung" }
  },
  {
    id: "ruckwarts-operator",
    name: "Urbildoperator F⁻¹",
    category: "Dynamik",
    latex: "F⁻¹(X) = {y ∈ S | F(y) ∈ X}",
    description: "Menge aller Punkte die nach X abbilden (Rückwärts-Iteration)",
    variables: { "X": "Zielmenge", "F⁻¹": "Urbild-Funktion" }
  },

  // === CHAOS THEORY ===
  {
    id: "logistic-map",
    name: "Logistic Map",
    category: "Chaos",
    latex: "xₙ₊₁ = r · xₙ · (1 - xₙ)",
    description: "Polynomial mapping demonstrating how complex chaotic behavior arises from simple nonlinear dynamical equations",
    variables: { "xₙ": "Population ratio at step n", "r": "Growth rate parameter (0 < r ≤ 4)" }
  },
  {
    id: "lyapunov",
    name: "Lyapunov Exponent",
    category: "Chaos",
    latex: "λ = lim(n→∞) (1/n) · Σ log|F'(xᵢ)|",
    description: "Quantifies the rate of separation of infinitesimally close trajectories (λ>0 = Chaos)",
    variables: { "λ": "Lyapunov-Exponent", "F'(xᵢ)": "Derivative of map at xᵢ", "N": "Number of iterations" }
  },
  {
    id: "lorenz-system",
    name: "Lorenz Attractor",
    category: "Chaos",
    latex: "dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz",
    description: "System of ODEs with chaotic solutions modeling atmospheric convection",
    variables: { "σ": "Prandtl number", "ρ": "Rayleigh number", "β": "Geometric factor" }
  },
  {
    id: "feigenbaum",
    name: "Feigenbaum-Konstante",
    category: "Chaos",
    latex: "δ = 4.669201609...",
    description: "Universelle Konstante in periodenverdoppelnden Systemen",
    variables: { "δ": "Feigenbaum-Konstante", "aₙ": "Parameter value at nth bifurcation" }
  },
  {
    id: "sensitive-dependence",
    name: "Sensitive Abhängigkeit",
    category: "Chaos",
    latex: "|Fⁿ(x) - Fⁿ(y)| ≈ |x-y| · eⁿλ",
    description: "Schmetterlingseffekt - kleine Änderungen wachsen exponentiell",
    variables: { "λ": "Lyapunov", "n": "Zeit" }
  },
  {
    id: "henon",
    name: "Hénon-Abbildung",
    category: "Chaos",
    latex: "xₙ₊₁ = 1 - a·xₙ² + yₙ, yₙ₊₁ = b·xₙ",
    description: "2D chaotischer Attraktor",
    variables: { "a": "1.4", "b": "0.3", "x,y": "Zustand" }
  },

  // === OMNIGENESIS ===
  {
    id: "seed-generation",
    name: "OMNIGENESIS Seed",
    category: "OMNIGENESIS",
    latex: "kᵢ = (h + n·g + o + i) mod N",
    description: "Deterministische Seed-Berechnung pro Iteration",
    variables: { "h": "Entropie", "n": "Navigation", "g": "Geometrie", "o": "Offset", "i": "Index" }
  },
  {
    id: "omnigenesis-pipeline",
    name: "OMNIGENESIS Pipeline",
    category: "OMNIGENESIS",
    latex: "Entropy → Navigation → Geometry → Seed → ECDSA → Output",
    description: "Vollständige Key-Generierungs-Pipeline",
    variables: { "h,n,g": "Parameter", "k": "Seed", "Q": "Public Key" }
  },
  {
    id: "ulam-spiral",
    name: "Ulam-Spirale",
    category: "OMNIGENESIS",
    latex: "spiral(n) → (x,y) mit Primzahl-Diagonalen",
    description: "Geometrische Anordnung zeigt Primzahl-Muster",
    variables: { "n": "Zahl", "x,y": "Spiralkoordinaten" }
  },
  {
    id: "omnigenic-liability",
    name: "Omnigenic Liability Model",
    category: "OMNIGENESIS",
    latex: "y = Σᵢ βᵢgᵢ(core) + Σⱼ βⱼgⱼ(periph) + ε",
    description: "Models how all genes expressed in disease-relevant cells contribute to complex trait heritability",
    variables: { "y": "Phenotypic liability", "βᵢ": "Core gene effect", "gᵢ": "Genotype at locus i", "ε": "Environmental noise" }
  },
  {
    id: "heritability-partition",
    name: "Heritability Partition",
    category: "OMNIGENESIS",
    latex: "h² = σ²_G/σ²_P = (σ²_core + σ²_periph)/(σ²_G + σ²_E)",
    description: "Decomposes total heritability into core and peripheral genetic components",
    variables: { "h²": "Heritability", "σ²_G": "Genetic variance", "σ²_P": "Phenotypic variance" }
  },

  // === INFORMATION ===
  {
    id: "entropy-shannon",
    name: "Shannon-Entropie",
    category: "Information",
    latex: "H(X) = -Σ p(x) · log₂(p(x))",
    description: "Informationsgehalt einer Quelle",
    variables: { "H": "Entropie", "p(x)": "Wahrscheinlichkeit" }
  },
  {
    id: "entropy-bits",
    name: "Private Key Entropie",
    category: "Information",
    latex: "H(d) = log₂(N) ≈ 256 bits",
    description: "Entropie eines secp256k1 Private Keys",
    variables: { "H": "Bits", "N": "Kurvenordnung" }
  },
  {
    id: "kolmogorov",
    name: "Kolmogorov-Komplexität",
    category: "Information",
    latex: "K(x) = min{|p| : U(p) = x}",
    description: "Kürzestes Programm das x erzeugt",
    variables: { "K": "Komplexität", "p": "Programm", "U": "Universelle TM" }
  },

  // === STRING-THEORIE ===
  {
    id: "holographic",
    name: "Holographisches Prinzip",
    category: "String-Theorie",
    latex: "S ≤ A / (4·ℓₚ²)",
    description: "Information einer Region begrenzt durch Oberfläche",
    variables: { "S": "Entropie", "A": "Fläche", "ℓₚ": "Planck-Länge" }
  },
  {
    id: "ads-cft",
    name: "AdS/CFT Korrespondenz",
    category: "String-Theorie",
    latex: "Z_gravity[φ₀] = ⟨exp(∫φ₀O)⟩_CFT",
    description: "Dualität zwischen Gravitation und Feldtheorie",
    variables: { "Z": "Zustandssumme", "φ₀": "Randwert", "O": "CFT-Operator" }
  },
  {
    id: "nambu-goto",
    name: "Nambu-Goto Action",
    category: "String-Theorie",
    latex: "S = -T ∫ d²σ √(-det(g_αβ))",
    description: "Action for a relativistic string proportional to the area of the worldsheet swept out in spacetime",
    variables: { "S": "Action", "T": "String tension", "g_αβ": "Induced metric on worldsheet" }
  },
  {
    id: "polyakov-action",
    name: "Polyakov Action",
    category: "String-Theorie",
    latex: "S_P = -(T/2) ∫ d²σ √(-h) h^αβ ∂_α X^μ ∂_β X_μ",
    description: "Equivalent formulation of the string action using an independent worldsheet metric",
    variables: { "h_αβ": "Worldsheet metric", "X^μ": "Spacetime embedding", "T": "String tension" }
  },
  {
    id: "beta-function",
    name: "Weyl Anomaly / Beta Function",
    category: "String-Theorie",
    latex: "β^G_μν = R_μν + 2∇_μ∇_ν Φ - (1/4)H_μλκ H_ν^λκ = 0",
    description: "Vanishing beta function condition ensuring conformal invariance, yielding equations of motion for background fields",
    variables: { "R_μν": "Ricci tensor", "Φ": "Dilaton field", "H_μνλ": "Kalb-Ramond field strength" }
  },

  // === KOSMOLOGIE ===
  {
    id: "de-sitter",
    name: "De-Sitter Metrik",
    category: "Kosmologie",
    latex: "ds² = -dt² + e^(2Ht)(dx² + dy² + dz²)",
    description: "Metrik eines expandierenden Universums",
    variables: { "H": "Hubble-Konstante", "t": "Zeit" }
  },
  {
    id: "friedmann",
    name: "Friedmann-Gleichung",
    category: "Kosmologie",
    latex: "H² = (8πG/3)ρ - k/a² + Λ/3",
    description: "Governs the expansion rate of the universe in the framework of general relativity",
    variables: { "H": "Hubble parameter", "G": "Newton's constant", "ρ": "Energy density", "k": "Curvature", "Λ": "Cosmological constant" }
  },
  {
    id: "einstein-field",
    name: "Einstein Field Equations",
    category: "Kosmologie",
    latex: "G_μν + Λg_μν = (8πG/c⁴) T_μν",
    description: "Relate the geometry of spacetime to the distribution of matter within it",
    variables: { "G_μν": "Einstein tensor", "g_μν": "Metric tensor", "T_μν": "Stress-energy tensor", "Λ": "Cosmological constant" }
  },
  {
    id: "hawking-temperature",
    name: "Hawking Temperature",
    category: "Kosmologie",
    latex: "T_H = ℏc³ / (8πGMk_B)",
    description: "Temperature of black body radiation predicted to be emitted by black holes due to quantum effects",
    variables: { "T_H": "Hawking temperature", "ℏ": "Reduced Planck constant", "M": "Black hole mass", "k_B": "Boltzmann constant" }
  },

  // === LATTICE CRYPTANALYSIS ===
  {
    id: "lll-bound",
    name: "LLL Bound",
    category: "Lattice Cryptanalysis",
    latex: "‖b₁*‖ ≤ 2^((n-1)/4) · (det L)^(1/n)",
    description: "Upper bound on the shortest vector found by the Lenstra–Lenstra–Lovász lattice basis reduction algorithm",
    variables: { "b₁*": "Shortest reduced basis vector", "n": "Lattice dimension", "det L": "Lattice determinant" }
  },
  {
    id: "svp-hardness",
    name: "SVP Approximation",
    category: "Lattice Cryptanalysis",
    latex: "‖v‖ ≤ γ(n) · λ₁(L)",
    description: "Approximation factor for the Shortest Vector Problem, believed to be hard for polynomial γ(n)",
    variables: { "v": "Found vector", "γ(n)": "Approximation factor", "λ₁(L)": "Shortest vector length" }
  },
  {
    id: "learning-with-errors",
    name: "Learning With Errors (LWE)",
    category: "Lattice Cryptanalysis",
    latex: "b = ⟨a, s⟩ + e (mod q)",
    description: "Computational problem underlying many post-quantum cryptographic schemes",
    variables: { "a": "Random vector", "s": "Secret vector", "e": "Error term", "q": "Modulus" }
  },

  // === ATTACK ALGORITHMS ===
  {
    id: "grover-speedup",
    name: "Grover's Algorithm Speedup",
    category: "Attack Algorithms",
    latex: "O(√N) vs O(N) classical",
    description: "Quantum search algorithm providing quadratic speedup for unstructured search problems",
    variables: { "N": "Size of search space" }
  },
  {
    id: "shor-period",
    name: "Shor's Algorithm (Period Finding)",
    category: "Attack Algorithms",
    latex: "r : a^r ≡ 1 (mod N), gcd(a^(r/2) ± 1, N)",
    description: "Quantum algorithm for integer factorization in polynomial time, threatening RSA",
    variables: { "r": "Period of modular exponentiation", "a": "Random base", "N": "Number to factor" }
  },
  {
    id: "birthday-attack",
    name: "Birthday Attack Complexity",
    category: "Attack Algorithms",
    latex: "P(collision) ≈ 1 - e^(-n²/(2H)), n ≈ 1.2√H",
    description: "Probabilistic attack exploiting the birthday paradox to find hash collisions",
    variables: { "n": "Number of samples", "H": "Hash output space size" }
  },
  {
    id: "differential-cryptanalysis",
    name: "Differential Cryptanalysis",
    category: "Attack Algorithms",
    latex: "Pr[ΔY = ΔY* | ΔX = ΔX*] = p",
    description: "Studies how differences in input propagate through a cipher to find key-dependent patterns",
    variables: { "ΔX*": "Input difference", "ΔY*": "Output difference", "p": "Differential probability" }
  },

  // === BITCOIN SPECIFIC ===
  {
    id: "hashcash-pow",
    name: "Hashcash Proof of Work",
    category: "Bitcoin",
    latex: "SHA256(SHA256(header)) < 2²²⁴/D",
    description: "Bitcoin's proof-of-work requiring miners to find a hash below a difficulty target",
    variables: { "header": "Block header", "D": "Difficulty parameter" }
  },
  {
    id: "difficulty-adjustment",
    name: "Difficulty Adjustment",
    category: "Bitcoin",
    latex: "D_new = D_old × (T_actual / T_target)",
    description: "Retargets mining difficulty every 2016 blocks to maintain ~10 minute block intervals",
    variables: { "D": "Difficulty", "T_actual": "Time for last 2016 blocks", "T_target": "Expected time (2 weeks)" }
  },
  {
    id: "ecdsa-bitcoin-sig",
    name: "ECDSA Bitcoin Signature",
    category: "Bitcoin",
    latex: "s = k⁻¹(z + r·d_A) mod n",
    description: "Elliptic Curve Digital Signature Algorithm used in Bitcoin transaction signing",
    variables: { "s": "Signature component", "k": "Random nonce", "z": "Message hash", "r": "x-coordinate of kG", "d_A": "Private key" }
  },

  // === ENTROPY COLLAPSE VECTORS ===
  {
    id: "min-entropy",
    name: "Min-Entropy",
    category: "Entropy Collapse",
    latex: "H_∞(X) = -log₂ max_x p(x)",
    description: "Most conservative measure of entropy, based on the probability of the most likely outcome",
    variables: { "H_∞": "Min-entropy", "p(x)": "Probability of most likely outcome" }
  },
  {
    id: "entropy-rate-decay",
    name: "Entropy Rate Decay",
    category: "Entropy Collapse",
    latex: "Hₙ = H₀ · e^(-λt) + H_floor",
    description: "Models the degradation of entropy in poorly seeded pseudorandom number generators",
    variables: { "Hₙ": "Entropy at time n", "H₀": "Initial entropy", "λ": "Decay rate", "H_floor": "Minimum entropy floor" }
  },
  {
    id: "leftover-hash",
    name: "Leftover Hash Lemma",
    category: "Entropy Collapse",
    latex: "SD(h(X), U_m) ≤ (1/2)√(2^(m - H_∞(X)))",
    description: "Guarantees that applying a universal hash function to a high-entropy source yields near-uniform output",
    variables: { "SD": "Statistical distance", "h": "Universal hash function", "m": "Output length", "H_∞": "Min-entropy of source" }
  },

  // === COMPLEXITY CLASSES ===
  {
    id: "p-vs-np",
    name: "P vs NP",
    category: "Complexity",
    latex: "P ⊆ NP, P ≟ NP",
    description: "The most important open problem in theoretical computer science",
    variables: { "P": "Polynomial time decidable", "NP": "Nondeterministic polynomial time verifiable" }
  },
  {
    id: "bqp-definition",
    name: "BQP (Bounded-Error Quantum Polynomial)",
    category: "Complexity",
    latex: "BPP ⊆ BQP ⊆ PSPACE",
    description: "Class of decision problems solvable by a quantum computer in polynomial time with bounded error",
    variables: { "BPP": "Bounded-error probabilistic polynomial", "BQP": "Bounded-error quantum polynomial", "PSPACE": "Polynomial space" }
  },
  {
    id: "np-completeness",
    name: "Cook-Levin Theorem",
    category: "Complexity",
    latex: "SAT ∈ NP-complete ⇒ ∀L ∈ NP, L ≤_p SAT",
    description: "Boolean satisfiability is NP-complete: every NP problem can be reduced to SAT in polynomial time",
    variables: { "SAT": "Boolean satisfiability problem", "≤_p": "Polynomial-time reduction", "NP": "Nondeterministic polynomial time" }
  },

  // === ZUSTANDSGEBUNDENE SCHLÜSSEL (W_dyn) ===
  {
    id: "wdyn-system",
    name: "Zustandsgebundenes Wallet-System",
    category: "W_dyn",
    latex: "\\mathcal{W}_{dyn} = (X, F: X \\times \\mathbb{T} \\times \\Sigma \\to X, G: X \\to \\mathcal{A}, \\sigma)",
    description: "Dynamisches Schlüssel-Evolutionssystem ohne stabilen Zielwert (Def. 1.2.1)",
    variables: { X: "Zustandsraum |X|=2^η", F: "Übergangsfunktion", G: "Adressfunktion", "σ": "Kontextvektor (online)" }
  },
  {
    id: "wdyn-trajectory",
    name: "Zustandstrajectorie",
    category: "W_dyn",
    latex: "x_t = F^t(x_0, \\Sigma^{[0,t)}), \\quad A_t = G(x_t)",
    description: "Iterierte Anwendung von F über Zeit & Kontext-Sequenz",
    variables: { "x_t": "Zustand zur Zeit t", "A_t": "Adresse zur Zeit t", "Σ": "Kontextsequenz" }
  },
  {
    id: "wdyn-forward-secrecy",
    name: "Forward Secrecy (Axiom 1.3.2)",
    category: "W_dyn",
    latex: "I(x_t ; A_0, A_1, \\ldots, A_{t-1}) \\leq \\epsilon_{fs}",
    description: "Bisherige Adressen offenbaren keine Information über aktuellen Zustand",
    variables: { I: "Mutual Information", "ε_fs": "FS-Fehler (vernachlässigbar)" }
  },
  {
    id: "wdyn-non-invertibility",
    name: "Nicht-Invertierbarkeit (Axiom 1.3.3)",
    category: "W_dyn",
    latex: "\\Pr[\\mathcal{A}(x_{t+1}, t, \\sigma_t) = x_t] \\leq 2^{-\\eta} + \\epsilon",
    description: "Kein effizienter Algorithmus invertiert F ohne σ_t",
    variables: { "η": "Entropie-Parameter", "σ_t": "Kontext (außerhalb Adversary-Modell)" }
  },
  {
    id: "wdyn-non-harvest",
    name: "Non-Harvestability (Satz 2.3.1)",
    category: "W_dyn",
    latex: "\\Pr[\\text{Erfolg bei } \\tau > t^*] = 0",
    description: "Kern-Resultat: rekonstruierter Zustand x_t* ist ab t*+1 wertlos",
    variables: { "t*": "Angriffszeitpunkt", "τ": "Späterer Zeitpunkt" }
  },
  {
    id: "wdyn-zero-info",
    name: "Zero-Information Korollar (2.4.1)",
    category: "W_dyn",
    latex: "I(x_{t+k}; A_t, A_{t+1}, \\ldots, A_{t+k-1}) = 0",
    description: "Beobachtung früherer Adressen → null Information über zukünftige Zustände",
    variables: { k: "Forward-Schritte ≥ 1" }
  },
  {
    id: "wdyn-equivocation",
    name: "Konstante Äquivokation (3.2.1)",
    category: "W_dyn",
    latex: "E_t = H(x_t \\mid A_0, \\ldots, A_{t-1}) = \\eta - \\epsilon_{fs} \\approx \\eta",
    description: "Äquivokation bleibt über gesamte Lebensdauer konstant (kein Entropie-Kollaps)",
    variables: { "E_t": "Äquivokation zur Zeit t", H: "Bedingte Entropie" }
  },
  {
    id: "wdyn-regret",
    name: "Angreifer-Regret (Def. 9.2.1)",
    category: "W_dyn",
    latex: "\\text{Regret}(\\mathcal{A}, t) = T_A + 2^{\\eta} \\cdot 0 = T_A",
    description: "Regret ist immer positiv → rationaler Offline-Angriff unmöglich",
    variables: { "T_A": "Rechenzeit Angreifer", "V(x_t)": "Wert des Zustands = 0 nach t+1" }
  },

  // === STRUKTURIERTER KANDIDATENRAUM (Paper II Teil IV) ===
  {
    id: "affine-nonce",
    name: "Affin-parametrisierter Nonce-Raum",
    category: "W_dyn",
    latex: "k_i = \\alpha + \\beta \\cdot i \\pmod{N}, \\quad \\gcd(\\beta, N) = 1",
    description: "Strukturierter Nonce-Kandidatenraum mit affiner Parametrisierung",
    variables: { "α": "Offset", "β": "Schrittweite", N: "Kurvenordnung" }
  },
  {
    id: "induced-key-space",
    name: "Induzierter Schlüsselraum",
    category: "W_dyn",
    latex: "d_i = c_0 + c_1 \\cdot i \\pmod{N}, \\quad c_1 = s \\beta r^{-1}",
    description: "Affine Schlüsselableitung aus strukturiertem Nonce (Satz 4.3.1: Surjektivität)",
    variables: { "c_0": "(sα-z)r⁻¹", "c_1": "sβr⁻¹", "d_i": "Kandidatenschlüssel" }
  },

  // === ARCHON-100 (Rekursive Bewusstseins-Engine) ===
  {
    id: "archon-core",
    name: "ARCHON-100 Kernformel",
    category: "ARCHON-100",
    latex: "C = \\text{Rekursion}(M \\times S \\times Q \\times L)",
    description: "Bewusstseinsintensität als Rekursion über Bemerken, Selbstmodell, Simulation, Ressourcenlast",
    variables: { C: "Bewusstseinsintensität", M: "Bemerken", S: "Selbstmodell-Komplexität", Q: "Simulationsqualität", L: "Systemlast" }
  },
  {
    id: "archon-equation",
    name: "ARCHON Arbeitsgleichung",
    category: "ARCHON-100",
    latex: "C(t) = \\frac{f(M \\cdot S \\cdot P \\cdot L \\cdot Q)}{R_{\\text{Verlust}} + K_{\\text{Bruch}}}",
    description: "Bewusstsein steigt mit bemerkter Zustandsänderung und Vorhersagefehler, sinkt mit Ressourcenverlust und Kohärenzbruch",
    variables: { P: "Vorhersagefehler", R: "Ressourcen", K: "Kohärenz" }
  },
  {
    id: "archon-theory-score",
    name: "Theory Score (METRON)",
    category: "ARCHON-100",
    latex: "\\text{score} = \\frac{c + e + co + n + t + cp}{6} - r",
    description: "Aggregierter Theoriewert: Mittel aus Klarheit, Evidenz, Kohärenz, Neuheit, Testbarkeit, Kompression minus Risiko",
    variables: { c: "clarity", e: "evidence", co: "coherence", n: "novelty", t: "testability", cp: "compression", r: "risk" }
  },
  {
    id: "archon-a1",
    name: "Axiom A1 · Endlichkeit",
    category: "ARCHON-100",
    latex: "\\forall \\Sigma: \\; R(\\Sigma) < \\infty",
    description: "Jedes reale System besitzt begrenzte Energie, Zeit, Speicher, Aufmerksamkeit, Fehlertoleranz",
    variables: { "Σ": "System", R: "Ressourcen" }
  },
  {
    id: "archon-a3",
    name: "Axiom A3 · Bemerken",
    category: "ARCHON-100",
    latex: "M_t = \\mathbb{1}\\{|dZ_t| > \\theta_{\\text{rel}}\\}",
    description: "Bemerken ist die interne Markierung einer Zustandsabweichung über Relevanzschwelle",
    variables: { dZ: "Zustandsänderung", θ: "Relevanzschwelle" }
  },
  {
    id: "archon-a5",
    name: "Axiom A5 · Rekursion",
    category: "ARCHON-100",
    latex: "B_n = \\phi(B_{n-1}), \\quad B_0 = M(S, Z)",
    description: "Bewusstsein als Fixpunkt-Operator: das System bemerkt, dass es bemerkt",
    variables: { B: "Bewusstseinszustand", φ: "Rekursionsoperator" }
  },
  {
    id: "archon-a8",
    name: "Axiom A8 · Entropiedruck",
    category: "ARCHON-100",
    latex: "\\frac{dK}{dt} = -\\lambda E + \\mu \\cdot C",
    description: "Kohärenz zerfällt unter Entropiedruck E, wird durch Bewusstseinsleistung C stabilisiert",
    variables: { K: "Kohärenz", E: "Entropiedruck", λ: "Zerfallsrate", μ: "Stabilisierungsrate" }
  },
];

export const categories = [...new Set(formulas.map(f => f.category))];
