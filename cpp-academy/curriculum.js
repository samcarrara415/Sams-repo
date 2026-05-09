/* C++ Academy curriculum data
 * Each lesson: id, title, body (HTML), example (C++ code),
 *              exercise: { prompt, starter, expected, stdin?, hint, solution }
 *
 * Code is run via JSCPP, which supports a useful subset of C++ (iostream,
 * string, vector, basic classes, control flow, pointers, references).
 */

const MODULES = [
  {
    id: 'm1',
    title: 'Foundations',
    sub: 'Set up your mind for C++. Output, types, and input.',
    lessons: [
      {
        id: 'l1',
        title: 'Hello, World!',
        body: `
          <p>Welcome. C++ is a fast, low-level language used in games, browsers, finance, embedded systems, and more. Every C++ program starts in the <code>main</code> function.</p>
          <h3>Anatomy of a program</h3>
          <ul>
            <li><code>#include &lt;iostream&gt;</code> pulls in the input/output library.</li>
            <li><code>int main()</code> is the entry point — execution starts here.</li>
            <li><code>std::cout</code> is the standard output stream. <code>&lt;&lt;</code> sends data to it.</li>
            <li><code>std::endl</code> writes a newline and flushes the buffer.</li>
            <li><code>return 0;</code> tells the OS the program ended successfully.</li>
          </ul>
          <div class="callout">Semicolons end statements. Forgetting one is the most common compile error.</div>
        `,
        example: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Print exactly: <code>Hello, C++!</code>',
          starter: `#include <iostream>

int main() {
    // Print Hello, C++!
    return 0;
}
`,
          expected: 'Hello, C++!\n',
          hint: 'Use std::cout << "Hello, C++!" << std::endl;',
          solution: `#include <iostream>
int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l2',
        title: 'Variables & Basic Types',
        body: `
          <p>C++ is statically typed: every variable has a type fixed at compile time. The compiler uses types to allocate memory and catch mistakes early.</p>
          <h3>Common built-in types</h3>
          <ul>
            <li><code>int</code> — whole numbers, e.g. <code>42</code>, <code>-7</code></li>
            <li><code>double</code> — decimals, e.g. <code>3.14</code></li>
            <li><code>char</code> — single character, e.g. <code>'A'</code></li>
            <li><code>bool</code> — <code>true</code> or <code>false</code></li>
            <li><code>std::string</code> — text, requires <code>&lt;string&gt;</code></li>
          </ul>
          <p>Declare with <code>type name = value;</code>.</p>
        `,
        example: `#include <iostream>
#include <string>

int main() {
    int    age   = 21;
    double pi    = 3.14159;
    char   grade = 'A';
    bool   ready = true;
    std::string name = "Sam";

    std::cout << name << " is " << age << " years old." << std::endl;
    std::cout << "Pi ~ " << pi << ", grade " << grade << std::endl;
    std::cout << "Ready? " << ready << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Declare an <code>int</code> called <code>year</code> set to 2026 and print: <code>Year: 2026</code>',
          starter: `#include <iostream>

int main() {
    // declare and print year
    return 0;
}
`,
          expected: 'Year: 2026\n',
          hint: 'std::cout << "Year: " << year << std::endl;',
          solution: `#include <iostream>
int main() {
    int year = 2026;
    std::cout << "Year: " << year << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l3',
        title: 'Constants & const',
        body: `
          <p><code>const</code> marks a value as unchangeable after initialization. Use it whenever a value should not be modified — it documents intent and lets the compiler catch bugs.</p>
          <p><code>constexpr</code> goes further: the value must be known at compile time.</p>
          <div class="callout">Rule of thumb: prefer <code>const</code>. Mutating less code is safer code.</div>
        `,
        example: `#include <iostream>

int main() {
    const double TAX = 0.08;
    double price = 19.99;
    double total = price * (1 + TAX);
    std::cout << "Total: $" << total << std::endl;
    // TAX = 0.10; // would be a compile error
    return 0;
}
`,
        exercise: {
          prompt: 'Make <code>const int LIMIT = 100;</code> and print: <code>Limit is 100</code>',
          starter: `#include <iostream>

int main() {
    // declare LIMIT and print
    return 0;
}
`,
          expected: 'Limit is 100\n',
          hint: 'const int LIMIT = 100;',
          solution: `#include <iostream>
int main() {
    const int LIMIT = 100;
    std::cout << "Limit is " << LIMIT << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l4',
        title: 'Reading input with cin',
        body: `
          <p><code>std::cin</code> reads from standard input. Use <code>&gt;&gt;</code> to extract values into variables.</p>
          <p>Input is whitespace-separated by default. To read a whole line, use <code>std::getline(std::cin, var)</code>.</p>
          <div class="callout">In this app, type your input lines in the <b>Stdin</b> box below the editor before running.</div>
        `,
        example: `#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;
    std::cout << "Enter name and age: ";
    std::cin >> name >> age;
    std::cout << "Hi " << name << ", age " << age << "." << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read two integers <code>a</code> and <code>b</code> from stdin and print their sum on one line.',
          starter: `#include <iostream>

int main() {
    int a, b;
    // read a and b, print a + b
    return 0;
}
`,
          expected: '12\n',
          stdin: '5\n7\n',
          hint: 'std::cin >> a >> b; then std::cout << (a + b) << std::endl;',
          solution: `#include <iostream>
int main() {
    int a, b;
    std::cin >> a >> b;
    std::cout << (a + b) << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l5',
        title: 'Operators & Expressions',
        body: `
          <p>Arithmetic: <code>+ - * / %</code>. Note: integer / integer truncates (<code>7 / 2 == 3</code>). Use a <code>double</code> if you want decimals.</p>
          <p>Comparison: <code>== != &lt; &lt;= &gt; &gt;=</code> — produce <code>bool</code>.</p>
          <p>Logical: <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not).</p>
          <p>Increment/decrement: <code>++x</code> / <code>x++</code> add 1.</p>
        `,
        example: `#include <iostream>

int main() {
    int a = 7, b = 2;
    std::cout << a / b << std::endl;          // 3
    std::cout << (double)a / b << std::endl;  // 3.5
    std::cout << a % b << std::endl;          // 1
    std::cout << (a > b && a < 10) << std::endl; // 1
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code> and print <code>even</code> if it is divisible by 2, else <code>odd</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // print "even" or "odd"
    return 0;
}
`,
          expected: 'even\n',
          stdin: '8\n',
          hint: 'Use n % 2 == 0',
          solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    if (n % 2 == 0) std::cout << "even" << std::endl;
    else std::cout << "odd" << std::endl;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm2',
    title: 'Control Flow',
    sub: 'Branches and loops — make programs decide.',
    lessons: [
      {
        id: 'l6',
        title: 'if / else if / else',
        body: `
          <p>Branch on a boolean condition. The body executes only when the condition is <code>true</code>.</p>
          <pre class="code"><span class="kw">if</span> (cond1) { ... }
<span class="kw">else if</span> (cond2) { ... }
<span class="kw">else</span> { ... }</pre>
          <p>Always use braces — even for one-line bodies. It avoids bugs when you add lines later.</p>
        `,
        example: `#include <iostream>

int main() {
    int score = 78;
    if (score >= 90)        std::cout << "A" << std::endl;
    else if (score >= 80)   std::cout << "B" << std::endl;
    else if (score >= 70)   std::cout << "C" << std::endl;
    else                    std::cout << "F" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read two ints and print the larger one (just the number).',
          starter: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    // print the larger
    return 0;
}
`,
          expected: '15\n',
          stdin: '15\n9\n',
          hint: 'if (a > b) print a; else print b;',
          solution: `#include <iostream>
int main() {
    int a, b; std::cin >> a >> b;
    if (a > b) std::cout << a << std::endl;
    else std::cout << b << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l7',
        title: 'switch / case',
        body: `
          <p>A <code>switch</code> picks a branch by exact integer/char value. Don't forget <code>break;</code>, or execution falls through to the next case.</p>
          <p><code>default</code> handles any value not matched.</p>
        `,
        example: `#include <iostream>

int main() {
    char op = '+';
    int a = 4, b = 3;
    switch (op) {
        case '+': std::cout << a + b << std::endl; break;
        case '-': std::cout << a - b << std::endl; break;
        case '*': std::cout << a * b << std::endl; break;
        default:  std::cout << "unknown" << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Read a single digit (1–3). Print: <code>one</code>, <code>two</code>, or <code>three</code>. Anything else: <code>?</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // switch on n
    return 0;
}
`,
          expected: 'two\n',
          stdin: '2\n',
          hint: 'switch (n) { case 1: ... break; case 2: ... }',
          solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    switch (n) {
        case 1: std::cout << "one" << std::endl; break;
        case 2: std::cout << "two" << std::endl; break;
        case 3: std::cout << "three" << std::endl; break;
        default: std::cout << "?" << std::endl;
    }
    return 0;
}`
        }
      },
      {
        id: 'l8',
        title: 'while & do-while loops',
        body: `
          <p><code>while</code> tests the condition <i>before</i> each iteration. <code>do { } while (cond);</code> tests <i>after</i>, so the body runs at least once.</p>
          <div class="callout">Update the loop variable inside the body, or you'll loop forever.</div>
        `,
        example: `#include <iostream>

int main() {
    int n = 1;
    while (n <= 5) {
        std::cout << n << " ";
        n++;
    }
    std::cout << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code>, then print the integers from 1 to <code>n</code> separated by spaces, ending with a newline.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // loop and print 1..n separated by spaces
    return 0;
}
`,
          expected: '1 2 3 4 5 \n',
          stdin: '5\n',
          hint: 'while (i <= n) { std::cout << i << " "; i++; }',
          solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    int i = 1;
    while (i <= n) { std::cout << i << " "; i++; }
    std::cout << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l9',
        title: 'for loops',
        body: `
          <p><code>for</code> packs init, condition, and update on one line. Use it whenever you know the iteration count up front.</p>
          <pre class="code"><span class="kw">for</span> (<span class="ty">int</span> i = 0; i &lt; 10; ++i) { ... }</pre>
          <p>Modern C++ also has the <b>range-based for</b> for collections — covered later.</p>
        `,
        example: `#include <iostream>

int main() {
    int sum = 0;
    for (int i = 1; i <= 10; ++i) sum += i;
    std::cout << "Sum 1..10 = " << sum << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read int <code>n</code>, print the sum of all integers from 1 to <code>n</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // print sum 1..n
    return 0;
}
`,
          expected: '55\n',
          stdin: '10\n',
          hint: 'for (int i = 1; i <= n; ++i) sum += i;',
          solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    int s = 0;
    for (int i = 1; i <= n; ++i) s += i;
    std::cout << s << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l10',
        title: 'break & continue',
        body: `
          <p><code>break</code> exits the innermost loop or switch. <code>continue</code> jumps to the next iteration of the loop.</p>
          <p>Use them sparingly — too many can make a loop hard to read.</p>
        `,
        example: `#include <iostream>

int main() {
    for (int i = 1; i <= 10; ++i) {
        if (i == 7) break;
        if (i % 2 == 0) continue;
        std::cout << i << " ";
    }
    std::cout << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Print all numbers from 1 to 20 <i>except</i> multiples of 3, separated by spaces.',
          starter: `#include <iostream>

int main() {
    for (int i = 1; i <= 20; ++i) {
        // skip multiples of 3
    }
    std::cout << std::endl;
    return 0;
}
`,
          expected: '1 2 4 5 7 8 10 11 13 14 16 17 19 20 \n',
          hint: 'if (i % 3 == 0) continue;',
          solution: `#include <iostream>
int main() {
    for (int i = 1; i <= 20; ++i) {
        if (i % 3 == 0) continue;
        std::cout << i << " ";
    }
    std::cout << std::endl;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm3',
    title: 'Functions',
    sub: 'Reusable pieces. Parameters, returns, references.',
    lessons: [
      {
        id: 'l11',
        title: 'Defining functions',
        body: `
          <p>A function packages logic so you can call it many times. Declare with <code>returnType name(parameters)</code>.</p>
          <p>You can declare it (a prototype) above <code>main</code> and define it below — useful for organization.</p>
        `,
        example: `#include <iostream>

int square(int x) {
    return x * x;
}

int main() {
    std::cout << square(5) << std::endl;
    std::cout << square(9) << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Write a function <code>cube(int x)</code> that returns x*x*x. Read an int from stdin and print its cube.',
          starter: `#include <iostream>

// define cube here

int main() {
    int n;
    std::cin >> n;
    // print cube(n)
    return 0;
}
`,
          expected: '27\n',
          stdin: '3\n',
          hint: 'int cube(int x) { return x*x*x; }',
          solution: `#include <iostream>
int cube(int x) { return x*x*x; }
int main() {
    int n; std::cin >> n;
    std::cout << cube(n) << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l12',
        title: 'Pass by value vs reference',
        body: `
          <p>By default, parameters are <b>copies</b>. Modifying them inside the function does <i>not</i> affect the caller.</p>
          <p>Pass by reference with <code>&amp;</code> to share the original variable. Use <code>const T&amp;</code> to share without allowing changes — efficient for big objects.</p>
        `,
        example: `#include <iostream>

void addOne(int x)        { x += 1; }
void addOneRef(int &x)    { x += 1; }

int main() {
    int a = 5;
    addOne(a);    std::cout << a << std::endl; // 5
    addOneRef(a); std::cout << a << std::endl; // 6
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>void doubleIt(int &amp;x)</code> that doubles x in place. Read an int and print it after doubling.',
          starter: `#include <iostream>

// define doubleIt

int main() {
    int n;
    std::cin >> n;
    // call doubleIt(n) and print n
    return 0;
}
`,
          expected: '14\n',
          stdin: '7\n',
          hint: 'void doubleIt(int &x) { x *= 2; }',
          solution: `#include <iostream>
void doubleIt(int &x) { x *= 2; }
int main() {
    int n; std::cin >> n;
    doubleIt(n);
    std::cout << n << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l13',
        title: 'Default args & overloading',
        body: `
          <p>Parameters can have defaults: <code>void greet(std::string n = "friend")</code>. Callers can omit the argument.</p>
          <p>You can have multiple functions with the same name as long as parameter types differ — that's <b>overloading</b>.</p>
        `,
        example: `#include <iostream>
#include <string>

void greet(std::string n = "friend") {
    std::cout << "Hi, " << n << std::endl;
}

int add(int a, int b)       { return a + b; }
double add(double a, double b) { return a + b; }

int main() {
    greet();
    greet("Sam");
    std::cout << add(1, 2) << std::endl;
    std::cout << add(1.5, 2.5) << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>int max(int a, int b)</code> AND <code>int max(int a, int b, int c)</code>. Read three ints and print <code>max(a,b,c)</code>.',
          starter: `#include <iostream>

// define both max overloads

int main() {
    int a, b, c;
    std::cin >> a >> b >> c;
    // print max(a,b,c)
    return 0;
}
`,
          expected: '12\n',
          stdin: '4\n12\n7\n',
          hint: 'Three-arg max can call two-arg twice.',
          solution: `#include <iostream>
int max(int a, int b) { return a > b ? a : b; }
int max(int a, int b, int c) { return max(max(a,b), c); }
int main() {
    int a,b,c; std::cin >> a >> b >> c;
    std::cout << max(a,b,c) << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l14',
        title: 'Recursion',
        body: `
          <p>A function that calls itself is <b>recursive</b>. Every recursion needs a <i>base case</i> that stops the recursion, or it'll overflow the stack.</p>
          <p>Classic example: factorial. <code>n! = n * (n-1)!</code>, with <code>0! = 1</code>.</p>
        `,
        example: `#include <iostream>

int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}

int main() {
    std::cout << fact(5) << std::endl; // 120
    return 0;
}
`,
        exercise: {
          prompt: 'Write a recursive <code>int sumTo(int n)</code> returning 1+2+...+n. Read n and print the result.',
          starter: `#include <iostream>

// recursive sumTo

int main() {
    int n;
    std::cin >> n;
    // print sumTo(n)
    return 0;
}
`,
          expected: '15\n',
          stdin: '5\n',
          hint: 'Base: n <= 0 returns 0. Recursive: n + sumTo(n-1).',
          solution: `#include <iostream>
int sumTo(int n) {
    if (n <= 0) return 0;
    return n + sumTo(n - 1);
}
int main() {
    int n; std::cin >> n;
    std::cout << sumTo(n) << std::endl;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm4',
    title: 'Collections & Strings',
    sub: 'Arrays, strings, and the workhorse: vector.',
    lessons: [
      {
        id: 'l15',
        title: 'Arrays',
        body: `
          <p>A C-style array is a fixed-size block of elements of one type. Index from 0.</p>
          <pre class="code"><span class="ty">int</span> a[5] = {10, 20, 30, 40, 50};
a[0]; <span class="cm">// 10</span></pre>
          <p>Arrays don't know their length — you must track it. Reading past the end is undefined behavior.</p>
        `,
        example: `#include <iostream>

int main() {
    int nums[5] = {3, 1, 4, 1, 5};
    int sum = 0;
    for (int i = 0; i < 5; ++i) sum += nums[i];
    std::cout << "sum = " << sum << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read 5 ints into an array, then print the maximum.',
          starter: `#include <iostream>

int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    // find and print max
    return 0;
}
`,
          expected: '9\n',
          stdin: '3\n9\n2\n7\n4\n',
          hint: 'Track a running max as you scan.',
          solution: `#include <iostream>
int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    int m = a[0];
    for (int i = 1; i < 5; ++i) if (a[i] > m) m = a[i];
    std::cout << m << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l16',
        title: 'std::string',
        body: `
          <p><code>std::string</code> is a safe, dynamic text type. Concatenate with <code>+</code>, get length with <code>.size()</code>, access chars with <code>[i]</code>.</p>
          <p>Read a single word with <code>cin &gt;&gt; s</code>, a whole line with <code>getline(cin, s)</code>.</p>
        `,
        example: `#include <iostream>
#include <string>

int main() {
    std::string a = "Hello", b = "C++";
    std::string c = a + ", " + b + "!";
    std::cout << c << " (" << c.size() << " chars)" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read a word from stdin and print its length on a line.',
          starter: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    // print s.size()
    return 0;
}
`,
          expected: '5\n',
          stdin: 'hello\n',
          hint: 'std::cout << s.size() << std::endl;',
          solution: `#include <iostream>
#include <string>
int main() {
    std::string s; std::cin >> s;
    std::cout << s.size() << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l17',
        title: 'std::vector — the resizable array',
        body: `
          <p><code>std::vector&lt;T&gt;</code> is a dynamic array. It grows as you push elements and remembers its size.</p>
          <ul>
            <li><code>v.push_back(x)</code> — add to end</li>
            <li><code>v.size()</code> — number of elements</li>
            <li><code>v[i]</code> — index access</li>
            <li><code>v.empty()</code> — true if zero elements</li>
          </ul>
          <p>Use vector instead of raw arrays in modern C++ wherever possible.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    for (int i = 1; i <= 5; ++i) v.push_back(i * i);
    for (int i = 0; i < (int)v.size(); ++i) std::cout << v[i] << " ";
    std::cout << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code>, then n ints, push each into a vector, print the sum on a line.',
          starter: `#include <iostream>
#include <vector>

int main() {
    int n;
    std::cin >> n;
    std::vector<int> v;
    // read n ints, sum them
    return 0;
}
`,
          expected: '15\n',
          stdin: '5\n1\n2\n3\n4\n5\n',
          hint: 'for n iterations: cin >> x; v.push_back(x); sum += x;',
          solution: `#include <iostream>
#include <vector>
int main() {
    int n; std::cin >> n;
    std::vector<int> v;
    int sum = 0, x;
    for (int i = 0; i < n; ++i) { std::cin >> x; v.push_back(x); sum += x; }
    std::cout << sum << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l18',
        title: 'Range-based for',
        body: `
          <p>Modern C++ has a clean syntax for iterating any container: <code>for (auto x : container)</code>.</p>
          <p>Use <code>auto&amp;</code> to reference elements (no copy), <code>const auto&amp;</code> if read-only.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {10, 20, 30, 40};
    int total = 0;
    for (int x : v) total += x;
    std::cout << total << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Vector <code>{2, 4, 6, 8, 10}</code>: use a range-based for to print the count of even numbers (it will be 5).',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {2, 4, 6, 8, 10};
    int evens = 0;
    // count evens with range-based for
    std::cout << evens << std::endl;
    return 0;
}
`,
          expected: '5\n',
          hint: 'for (int x : v) if (x % 2 == 0) evens++;',
          solution: `#include <iostream>
#include <vector>
int main() {
    std::vector<int> v = {2,4,6,8,10};
    int evens = 0;
    for (int x : v) if (x % 2 == 0) evens++;
    std::cout << evens << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l19',
        title: 'Multidimensional & nested data',
        body: `
          <p>You can store a vector of vectors to model a grid: <code>std::vector&lt;std::vector&lt;int&gt;&gt; grid</code>.</p>
          <p>Or a 2D fixed array: <code>int g[3][4];</code> — three rows of four columns.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> g = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    for (auto &row : g) {
        for (int x : row) std::cout << x << " ";
        std::cout << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Build a 3x3 grid where <code>g[i][j] = i*3 + j + 1</code>. Print rows separated by newlines, values by spaces.',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> g(3, std::vector<int>(3));
    // fill and print
    return 0;
}
`,
          expected: '1 2 3 \n4 5 6 \n7 8 9 \n',
          hint: 'Two nested loops; assign then print.',
          solution: `#include <iostream>
#include <vector>
int main() {
    std::vector<std::vector<int>> g(3, std::vector<int>(3));
    for (int i = 0; i < 3; ++i)
        for (int j = 0; j < 3; ++j)
            g[i][j] = i*3 + j + 1;
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 3; ++j) std::cout << g[i][j] << " ";
        std::cout << std::endl;
    }
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm5',
    title: 'Pointers & Memory',
    sub: 'The superpower (and footgun) of C++.',
    lessons: [
      {
        id: 'l20',
        title: 'Pointers — what & why',
        body: `
          <p>A pointer is a variable that stores a memory address. Declare with <code>T* p;</code>. Get an address with <code>&amp;x</code>. Get the value at the address with <code>*p</code>.</p>
          <pre class="code"><span class="ty">int</span> x = 10;
<span class="ty">int</span>* p = &amp;x;
*p = 20;       <span class="cm">// x is now 20</span></pre>
          <div class="callout">A null pointer (<code>nullptr</code>) points to nothing. Dereferencing it crashes.</div>
        `,
        example: `#include <iostream>

int main() {
    int x = 42;
    int* p = &x;
    std::cout << "x = " << x << ", *p = " << *p << std::endl;
    *p = 100;
    std::cout << "after *p = 100, x = " << x << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code>, take its address into a pointer, set <code>*p = *p * 2</code>, then print <code>n</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // pointer p to n; double via *p
    return 0;
}
`,
          expected: '20\n',
          stdin: '10\n',
          hint: 'int* p = &n; *p = *p * 2;',
          solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    int* p = &n;
    *p = *p * 2;
    std::cout << n << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l21',
        title: 'References',
        body: `
          <p>A reference (<code>T&amp;</code>) is an alias for an existing variable. Once bound, it can't be reseated.</p>
          <p>References are usually safer than pointers: no <code>nullptr</code>, no need to dereference.</p>
        `,
        example: `#include <iostream>

int main() {
    int x = 5;
    int& r = x;
    r = 99;  // changes x
    std::cout << x << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>void swap(int &amp;a, int &amp;b)</code> that swaps two ints. Test on inputs from stdin: read two, swap, print as <code>a b</code>.',
          starter: `#include <iostream>

// define swap

int main() {
    int a, b;
    std::cin >> a >> b;
    // swap, then print "a b"
    return 0;
}
`,
          expected: '7 3\n',
          stdin: '3\n7\n',
          hint: 'Use a temporary: int t = a; a = b; b = t;',
          solution: `#include <iostream>
void swap(int &a, int &b) { int t = a; a = b; b = t; }
int main() {
    int a, b; std::cin >> a >> b;
    swap(a, b);
    std::cout << a << " " << b << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l22',
        title: 'Dynamic memory: new / delete',
        body: `
          <p><code>new T</code> allocates a <code>T</code> on the heap and returns a pointer. <code>delete p</code> frees it.</p>
          <p>For arrays: <code>new T[n]</code> and <code>delete[] p</code>.</p>
          <div class="callout">Forget to delete → memory leak. Delete twice → crash. This is why we prefer smart pointers (next module).</div>
        `,
        example: `#include <iostream>

int main() {
    int* p = new int(7);
    std::cout << *p << std::endl;
    delete p;

    int* arr = new int[3]{10, 20, 30};
    for (int i = 0; i < 3; ++i) std::cout << arr[i] << " ";
    std::cout << std::endl;
    delete[] arr;
    return 0;
}
`,
        exercise: {
          prompt: 'Heap-allocate an array of 5 ints, fill with 1..5, print them on one line space-separated, then delete[] it.',
          starter: `#include <iostream>

int main() {
    int* a = new int[5];
    // fill 1..5, print, delete[]
    return 0;
}
`,
          expected: '1 2 3 4 5 \n',
          hint: 'a[i] = i + 1;',
          solution: `#include <iostream>
int main() {
    int* a = new int[5];
    for (int i = 0; i < 5; ++i) a[i] = i + 1;
    for (int i = 0; i < 5; ++i) std::cout << a[i] << " ";
    std::cout << std::endl;
    delete[] a;
    return 0;
}`
        }
      },
      {
        id: 'l23',
        title: 'RAII — resource = lifetime',
        body: `
          <p>RAII (Resource Acquisition Is Initialization) is THE C++ idiom: tie resource ownership to an object's lifetime. When the object goes out of scope, its destructor releases the resource. No leaks.</p>
          <p>Modern code uses RAII everywhere: <code>std::vector</code> manages its memory, <code>std::ofstream</code> closes its file in its destructor, <code>std::unique_ptr</code> deletes its pointee.</p>
        `,
        example: `#include <iostream>
#include <vector>

void process() {
    std::vector<int> v(1000); // allocated...
    v[0] = 42;
    std::cout << v[0] << std::endl;
} // ...freed automatically here

int main() {
    process();
    std::cout << "no leak" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Without using <code>new</code>, fill a local <code>std::vector&lt;int&gt;</code> with 1..3 and print: <code>1 2 3</code> (with trailing space + newline).',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    // push 1, 2, 3; print them
    return 0;
}
`,
          expected: '1 2 3 \n',
          hint: 'v.push_back(i); then loop print.',
          solution: `#include <iostream>
#include <vector>
int main() {
    std::vector<int> v;
    for (int i = 1; i <= 3; ++i) v.push_back(i);
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l24',
        title: 'Common pointer pitfalls',
        body: `
          <p>The classics:</p>
          <ul>
            <li><b>Dangling pointer</b>: pointing to memory that's been freed.</li>
            <li><b>Double free</b>: calling <code>delete</code> twice on the same pointer.</li>
            <li><b>Memory leak</b>: forgetting to <code>delete</code>.</li>
            <li><b>Buffer overflow</b>: writing past the end of an array.</li>
            <li><b>Null deref</b>: dereferencing <code>nullptr</code>.</li>
          </ul>
          <p>Best defenses: prefer references, prefer containers (vector, string), prefer smart pointers, never write a raw <code>new</code> if you can avoid it.</p>
        `,
        example: `#include <iostream>

int main() {
    int* p = nullptr;
    if (p == nullptr) {
        std::cout << "p is null, won't dereference" << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int. If it is 0, print <code>null</code>. Otherwise, allocate an int with that value via <code>new</code>, print the dereferenced value, and <code>delete</code> it.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // handle 0 vs nonzero
    return 0;
}
`,
          expected: '7\n',
          stdin: '7\n',
          hint: 'if (n == 0) print null; else int* p = new int(n); print *p; delete p;',
          solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    if (n == 0) { std::cout << "null" << std::endl; return 0; }
    int* p = new int(n);
    std::cout << *p << std::endl;
    delete p;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm6',
    title: 'Object-Oriented C++',
    sub: 'Structs, classes, constructors, encapsulation.',
    lessons: [
      {
        id: 'l25',
        title: 'Structs',
        body: `
          <p>A <code>struct</code> groups related data into one type. Members are public by default.</p>
        `,
        example: `#include <iostream>
#include <string>

struct Point {
    int x;
    int y;
};

int main() {
    Point p;
    p.x = 3;
    p.y = 4;
    std::cout << "(" << p.x << ", " << p.y << ")" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Define a struct <code>Rect{int w; int h;}</code>. Create one with w=4, h=5 and print its area: <code>20</code>.',
          starter: `#include <iostream>

// struct Rect

int main() {
    // create, print w*h
    return 0;
}
`,
          expected: '20\n',
          hint: 'Rect r; r.w = 4; r.h = 5; print r.w * r.h.',
          solution: `#include <iostream>
struct Rect { int w; int h; };
int main() {
    Rect r; r.w = 4; r.h = 5;
    std::cout << r.w * r.h << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l26',
        title: 'Classes & access control',
        body: `
          <p>A <code>class</code> is like a struct but members are <code>private</code> by default. Use <code>public:</code> to expose methods.</p>
          <p>Encapsulation = hide internal state, expose a controlled interface.</p>
        `,
        example: `#include <iostream>

class Counter {
private:
    int count;
public:
    Counter() : count(0) {}
    void inc() { count++; }
    int  value() const { return count; }
};

int main() {
    Counter c;
    c.inc(); c.inc(); c.inc();
    std::cout << c.value() << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Build class <code>BankAccount</code> with private <code>balance</code> (starts 0), <code>deposit(int)</code>, and <code>balanceValue()</code>. Deposit 50, deposit 25, print balance.',
          starter: `#include <iostream>

// class BankAccount

int main() {
    // create, deposit, print
    return 0;
}
`,
          expected: '75\n',
          hint: 'Constructor sets balance to 0; deposit adds.',
          solution: `#include <iostream>
class BankAccount {
    int balance;
public:
    BankAccount() : balance(0) {}
    void deposit(int n) { balance += n; }
    int balanceValue() const { return balance; }
};
int main() {
    BankAccount a;
    a.deposit(50); a.deposit(25);
    std::cout << a.balanceValue() << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l27',
        title: 'Constructors',
        body: `
          <p>A constructor runs when an object is created. Use member initializer lists (<code>: name(value)</code>) for efficient initialization.</p>
          <p>Overload constructors to accept different argument sets.</p>
        `,
        example: `#include <iostream>
#include <string>

class Person {
public:
    std::string name;
    int age;
    Person() : name("?"), age(0) {}
    Person(std::string n, int a) : name(n), age(a) {}
    void greet() const {
        std::cout << "Hi, I'm " << name << " (" << age << ")" << std::endl;
    }
};

int main() {
    Person a;
    Person b("Sam", 21);
    a.greet();
    b.greet();
    return 0;
}
`,
        exercise: {
          prompt: 'Class <code>Box</code> with int <code>w, h</code>. Constructor takes w and h. Method <code>area()</code> returns w*h. Build a Box(6,7) and print its area.',
          starter: `#include <iostream>

// class Box

int main() {
    // create Box(6,7), print area
    return 0;
}
`,
          expected: '42\n',
          hint: 'Box(int w, int h) : w(w), h(h) {}',
          solution: `#include <iostream>
class Box {
    int w, h;
public:
    Box(int w, int h) : w(w), h(h) {}
    int area() const { return w * h; }
};
int main() {
    Box b(6, 7);
    std::cout << b.area() << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l28',
        title: 'Destructors',
        body: `
          <p>The destructor (<code>~ClassName()</code>) runs when the object goes out of scope. It's where you release resources owned by the object.</p>
          <p>For most modern classes, the compiler-generated destructor is fine — let RAII members clean themselves up.</p>
        `,
        example: `#include <iostream>

class Trace {
public:
    Trace()  { std::cout << "constructed" << std::endl; }
    ~Trace() { std::cout << "destructed" << std::endl; }
};

int main() {
    Trace t;
    std::cout << "in main" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Make class <code>Loud</code> printing <code>start</code> in its constructor and <code>end</code> in its destructor. In <code>main</code>, create one inside a {} block, then print <code>after</code>.',
          starter: `#include <iostream>

// class Loud

int main() {
    {
        // Loud l;
    }
    // print "after"
    return 0;
}
`,
          expected: 'start\nend\nafter\n',
          hint: 'Brace block forces destructor to run before "after".',
          solution: `#include <iostream>
class Loud {
public:
    Loud()  { std::cout << "start" << std::endl; }
    ~Loud() { std::cout << "end" << std::endl; }
};
int main() {
    { Loud l; }
    std::cout << "after" << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l29',
        title: 'this & const methods',
        body: `
          <p>Inside a member function, <code>this</code> is a pointer to the current object. <code>this-&gt;x</code> accesses member <code>x</code>.</p>
          <p>Mark a method <code>const</code> when it doesn't modify the object: <code>int area() const { ... }</code>. Const objects can only call const methods.</p>
        `,
        example: `#include <iostream>

class Square {
    int side;
public:
    Square(int s) : side(s) {}
    int area() const { return this->side * this->side; }
};

int main() {
    const Square sq(5);
    std::cout << sq.area() << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Class <code>Vec2</code> with members x,y and a <code>const</code> method <code>magnitudeSq()</code> returning x*x + y*y. Build Vec2(3,4) and print 25.',
          starter: `#include <iostream>

// class Vec2

int main() {
    // print magnitudeSq()
    return 0;
}
`,
          expected: '25\n',
          hint: 'magnitudeSq() const { return x*x + y*y; }',
          solution: `#include <iostream>
class Vec2 {
public:
    int x, y;
    Vec2(int x, int y) : x(x), y(y) {}
    int magnitudeSq() const { return x*x + y*y; }
};
int main() {
    Vec2 v(3, 4);
    std::cout << v.magnitudeSq() << std::endl;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm7',
    title: 'Inheritance & Polymorphism',
    sub: 'Build hierarchies, override behavior.',
    lessons: [
      {
        id: 'l30',
        title: 'Inheritance basics',
        body: `
          <p>A derived class inherits members of the base. Use <code>class D : public B</code>.</p>
          <p>The derived class can add new members and override behavior.</p>
        `,
        example: `#include <iostream>

class Animal {
public:
    void breathe() { std::cout << "breathe" << std::endl; }
};

class Dog : public Animal {
public:
    void bark() { std::cout << "woof" << std::endl; }
};

int main() {
    Dog d;
    d.breathe();
    d.bark();
    return 0;
}
`,
        exercise: {
          prompt: 'Derive <code>Cat</code> from <code>Animal</code> (inherits breathe). Add <code>meow()</code> printing <code>meow</code>. In main: cat.breathe(); cat.meow();',
          starter: `#include <iostream>

class Animal { public: void breathe() { std::cout << "breathe" << std::endl; } };

// class Cat : public Animal

int main() {
    // create cat; call breathe and meow
    return 0;
}
`,
          expected: 'breathe\nmeow\n',
          hint: 'class Cat : public Animal { public: void meow() { ... } };',
          solution: `#include <iostream>
class Animal { public: void breathe() { std::cout << "breathe" << std::endl; } };
class Cat : public Animal { public: void meow() { std::cout << "meow" << std::endl; } };
int main() {
    Cat c; c.breathe(); c.meow();
    return 0;
}`
        }
      },
      {
        id: 'l31',
        title: 'Virtual & override',
        body: `
          <p>Mark a method <code>virtual</code> in the base to allow derived classes to override it. Mark the override with <code>override</code> for safety.</p>
          <p>With virtual functions, a base pointer/reference calls the <i>derived</i> implementation — that's <b>polymorphism</b>.</p>
        `,
        example: `#include <iostream>

class Shape {
public:
    virtual void draw() const { std::cout << "shape" << std::endl; }
    virtual ~Shape() {}
};

class Circle : public Shape {
public:
    void draw() const override { std::cout << "circle" << std::endl; }
};

int main() {
    Shape* s = new Circle();
    s->draw();   // "circle"
    delete s;
    return 0;
}
`,
        exercise: {
          prompt: 'Add <code>Square</code> deriving from <code>Shape</code> whose draw prints <code>square</code>. Polymorphically call draw via Shape*.',
          starter: `#include <iostream>

class Shape {
public:
    virtual void draw() const { std::cout << "shape" << std::endl; }
    virtual ~Shape() {}
};

// class Square : public Shape

int main() {
    Shape* s = /* new Square(); */ nullptr;
    if (s) s->draw();
    delete s;
    return 0;
}
`,
          expected: 'square\n',
          hint: 'Use override on draw().',
          solution: `#include <iostream>
class Shape {
public: virtual void draw() const { std::cout << "shape" << std::endl; }
        virtual ~Shape() {}
};
class Square : public Shape {
public: void draw() const override { std::cout << "square" << std::endl; }
};
int main() {
    Shape* s = new Square();
    s->draw();
    delete s;
    return 0;
}`
        }
      },
      {
        id: 'l32',
        title: 'Abstract classes (interfaces)',
        body: `
          <p>An abstract class has at least one <i>pure virtual</i> method: <code>virtual void f() = 0;</code>. You can't instantiate it — only derive from it.</p>
          <p>This is C++'s way of declaring an interface.</p>
        `,
        example: `#include <iostream>

class Greeter {
public:
    virtual void greet() const = 0;
    virtual ~Greeter() {}
};

class Hi : public Greeter {
public:
    void greet() const override { std::cout << "hi" << std::endl; }
};

int main() {
    Hi g;
    g.greet();
    return 0;
}
`,
        exercise: {
          prompt: 'Add <code>Yo : Greeter</code> whose greet prints <code>yo</code>. Use a Greeter* to call it.',
          starter: `#include <iostream>

class Greeter {
public:
    virtual void greet() const = 0;
    virtual ~Greeter() {}
};

// Yo

int main() {
    Greeter* g = nullptr; // replace with new Yo();
    if (g) g->greet();
    delete g;
    return 0;
}
`,
          expected: 'yo\n',
          hint: 'class Yo : public Greeter { void greet() const override { ... } };',
          solution: `#include <iostream>
class Greeter { public: virtual void greet() const = 0; virtual ~Greeter() {} };
class Yo : public Greeter { public: void greet() const override { std::cout << "yo" << std::endl; } };
int main() {
    Greeter* g = new Yo();
    g->greet();
    delete g;
    return 0;
}`
        }
      },
      {
        id: 'l33',
        title: 'Polymorphic collections',
        body: `
          <p>Store derived objects via base pointers in a container — common pattern for "each element acts according to its real type".</p>
          <p>Always make the base destructor virtual when using polymorphism through pointers!</p>
        `,
        example: `#include <iostream>
#include <vector>

class Animal {
public:
    virtual void speak() const { std::cout << "..." << std::endl; }
    virtual ~Animal() {}
};
class Dog : public Animal { public: void speak() const override { std::cout << "woof" << std::endl; } };
class Cat : public Animal { public: void speak() const override { std::cout << "meow" << std::endl; } };

int main() {
    std::vector<Animal*> zoo;
    zoo.push_back(new Dog());
    zoo.push_back(new Cat());
    for (Animal* a : zoo) a->speak();
    for (Animal* a : zoo) delete a;
    return 0;
}
`,
        exercise: {
          prompt: 'Add a <code>Cow</code> printing <code>moo</code>. Push one Cow into the zoo (after Dog and Cat) and call speak() for all.',
          starter: `#include <iostream>
#include <vector>

class Animal { public: virtual void speak() const { std::cout << "..." << std::endl; } virtual ~Animal() {} };
class Dog : public Animal { public: void speak() const override { std::cout << "woof" << std::endl; } };
class Cat : public Animal { public: void speak() const override { std::cout << "meow" << std::endl; } };
// Cow

int main() {
    std::vector<Animal*> zoo;
    zoo.push_back(new Dog());
    zoo.push_back(new Cat());
    // push Cow
    for (Animal* a : zoo) a->speak();
    for (Animal* a : zoo) delete a;
    return 0;
}
`,
          expected: 'woof\nmeow\nmoo\n',
          hint: 'class Cow : public Animal { ... };',
          solution: `#include <iostream>
#include <vector>
class Animal { public: virtual void speak() const { std::cout << "..." << std::endl; } virtual ~Animal() {} };
class Dog : public Animal { public: void speak() const override { std::cout << "woof" << std::endl; } };
class Cat : public Animal { public: void speak() const override { std::cout << "meow" << std::endl; } };
class Cow : public Animal { public: void speak() const override { std::cout << "moo" << std::endl; } };
int main() {
    std::vector<Animal*> zoo;
    zoo.push_back(new Dog()); zoo.push_back(new Cat()); zoo.push_back(new Cow());
    for (Animal* a : zoo) a->speak();
    for (Animal* a : zoo) delete a;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm8',
    title: 'Templates & Generics',
    sub: 'Write code once, work for any type.',
    lessons: [
      {
        id: 'l34',
        title: 'Function templates',
        body: `
          <p>A function template is a recipe — the compiler stamps out a real function for each type you use.</p>
          <pre class="code"><span class="kw">template</span> &lt;<span class="kw">typename</span> T&gt;
T add(T a, T b) { <span class="kw">return</span> a + b; }</pre>
        `,
        example: `#include <iostream>

template <typename T>
T myMax(T a, T b) { return a > b ? a : b; }

int main() {
    std::cout << myMax(3, 9)       << std::endl; // int
    std::cout << myMax(2.5, 1.25)  << std::endl; // double
    return 0;
}
`,
        exercise: {
          prompt: 'Define a template <code>T myMin(T a, T b)</code>. Call it with two ints (5, 2) and print the result.',
          starter: `#include <iostream>

// template myMin

int main() {
    std::cout << /* myMin(5, 2) */ 0 << std::endl;
    return 0;
}
`,
          expected: '2\n',
          hint: 'a < b ? a : b',
          solution: `#include <iostream>
template <typename T>
T myMin(T a, T b) { return a < b ? a : b; }
int main() {
    std::cout << myMin(5, 2) << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l35',
        title: 'Class templates',
        body: `
          <p>Class templates work the same way — parametrized by type. <code>std::vector&lt;T&gt;</code> is an example.</p>
        `,
        example: `#include <iostream>

template <typename T>
class Box {
    T value;
public:
    Box(T v) : value(v) {}
    T get() const { return value; }
};

int main() {
    Box<int> a(5);
    Box<double> b(3.14);
    std::cout << a.get() << " " << b.get() << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Define <code>Pair&lt;T&gt;</code> holding two T values, with method <code>sum()</code>. Pair&lt;int&gt;(4, 6).sum() should print 10.',
          starter: `#include <iostream>

// template Pair

int main() {
    std::cout << /* Pair<int>(4,6).sum() */ 0 << std::endl;
    return 0;
}
`,
          expected: '10\n',
          hint: 'class template with two members of type T.',
          solution: `#include <iostream>
template <typename T>
class Pair {
    T a, b;
public:
    Pair(T x, T y) : a(x), b(y) {}
    T sum() const { return a + b; }
};
int main() {
    std::cout << Pair<int>(4, 6).sum() << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l36',
        title: 'A taste of the STL',
        body: `
          <p>The STL gives you containers (<code>vector</code>, <code>map</code>, <code>set</code>, <code>list</code>), iterators, and algorithms. Every C++ developer should know the basics.</p>
          <ul>
            <li><b>Containers</b>: store data</li>
            <li><b>Iterators</b>: a uniform way to traverse them</li>
            <li><b>Algorithms</b>: <code>sort</code>, <code>find</code>, <code>count</code>, etc.</li>
          </ul>
          <div class="callout">In this in-browser environment, complex algorithm headers may be limited. Always test in a full toolchain like clang or g++ for real projects.</div>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};
    int big = v[0];
    for (int x : v) if (x > big) big = x;
    std::cout << "max = " << big << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Given vector <code>{5, 2, 9, 1, 7}</code>, print the smallest using a loop.',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 9, 1, 7};
    // print min
    return 0;
}
`,
          expected: '1\n',
          hint: 'Track running min.',
          solution: `#include <iostream>
#include <vector>
int main() {
    std::vector<int> v = {5,2,9,1,7};
    int m = v[0];
    for (int x : v) if (x < m) m = x;
    std::cout << m << std::endl;
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm9',
    title: 'Modern C++',
    sub: 'auto, lambdas, smart pointers, move semantics.',
    lessons: [
      {
        id: 'l37',
        title: 'auto & range-based for',
        body: `
          <p><code>auto</code> lets the compiler deduce a type. Great for long template types: <code>auto it = v.begin();</code>.</p>
          <p>Don't overuse it — readable types are still valuable.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    auto x = 42;       // int
    auto pi = 3.14;    // double
    std::vector<int> v = {10, 20, 30};
    for (auto y : v) std::cout << y << " ";
    std::cout << std::endl;
    std::cout << x << " " << pi << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Vector <code>{2, 4, 8, 16, 32}</code>: use <code>auto</code> in a range-based loop to print the sum (it equals 62).',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {2, 4, 8, 16, 32};
    int s = 0;
    // sum with auto
    std::cout << s << std::endl;
    return 0;
}
`,
          expected: '62\n',
          hint: 'for (auto x : v) s += x;',
          solution: `#include <iostream>
#include <vector>
int main() {
    std::vector<int> v = {2,4,8,16,32};
    int s = 0;
    for (auto x : v) s += x;
    std::cout << s << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l38',
        title: 'Lambdas',
        body: `
          <p>A lambda is an inline anonymous function: <code>[](int x){ return x*x; }</code>. The <code>[]</code> is the capture list — what variables from the surrounding scope it can see.</p>
          <ul>
            <li><code>[]</code> capture nothing</li>
            <li><code>[=]</code> capture all by value</li>
            <li><code>[&amp;]</code> capture all by reference</li>
            <li><code>[x]</code> capture x by value</li>
          </ul>
          <div class="callout">Lambdas may have limited support in this in-browser sandbox; the syntax is the focus.</div>
        `,
        example: `#include <iostream>

int main() {
    int factor = 3;
    auto times = [factor](int x) { return x * factor; };
    std::cout << times(5) << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Define a lambda <code>plusOne</code> that returns x+1 (no captures). Print plusOne(41).',
          starter: `#include <iostream>

int main() {
    // auto plusOne = ...;
    std::cout << /* plusOne(41) */ 0 << std::endl;
    return 0;
}
`,
          expected: '42\n',
          hint: '[](int x){ return x + 1; }',
          solution: `#include <iostream>
int main() {
    auto plusOne = [](int x) { return x + 1; };
    std::cout << plusOne(41) << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l39',
        title: 'Smart pointers',
        body: `
          <p>Smart pointers automate <code>new</code>/<code>delete</code>. Three flavors:</p>
          <ul>
            <li><code>std::unique_ptr&lt;T&gt;</code> — single owner, can't copy. Most common.</li>
            <li><code>std::shared_ptr&lt;T&gt;</code> — reference-counted shared ownership.</li>
            <li><code>std::weak_ptr&lt;T&gt;</code> — non-owning observer of a shared_ptr.</li>
          </ul>
          <p>Create with <code>std::make_unique&lt;T&gt;(args)</code> / <code>std::make_shared&lt;T&gt;(args)</code>.</p>
          <div class="callout">Some smart-pointer features may not run in this sandbox; use a real toolchain for production work.</div>
        `,
        example: `#include <iostream>
#include <memory>

int main() {
    std::unique_ptr<int> p(new int(42));
    std::cout << *p << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Create a <code>unique_ptr&lt;int&gt;</code> holding 100 and print *p.',
          starter: `#include <iostream>
#include <memory>

int main() {
    // unique_ptr<int> holding 100
    return 0;
}
`,
          expected: '100\n',
          hint: 'std::unique_ptr<int> p(new int(100));',
          solution: `#include <iostream>
#include <memory>
int main() {
    std::unique_ptr<int> p(new int(100));
    std::cout << *p << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l40',
        title: 'Move semantics (concepts)',
        body: `
          <p>When you assign or pass big objects, copying is expensive. <b>Move semantics</b> lets you transfer ownership of resources cheaply.</p>
          <p>An rvalue reference (<code>T&amp;&amp;</code>) binds to temporaries. <code>std::move(x)</code> casts to rvalue, signaling "you may steal from x".</p>
          <p>Containers like <code>std::vector</code> use moves automatically when elements support it.</p>
          <div class="callout">This lesson is concept-focused. The key intuition: <i>moving</i> is fast, <i>copying</i> can be slow.</div>
        `,
        example: `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string a = "hello world";
    std::string b = std::move(a);   // b takes a's contents
    std::cout << "b = " << b << std::endl;
    std::cout << "a size = " << a.size() << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Build string <code>s</code> = "C++". Move it into <code>t</code>. Print t.',
          starter: `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string s = "C++";
    // move s into t and print t
    return 0;
}
`,
          expected: 'C++\n',
          hint: 'std::string t = std::move(s);',
          solution: `#include <iostream>
#include <string>
#include <utility>
int main() {
    std::string s = "C++";
    std::string t = std::move(s);
    std::cout << t << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l41',
        title: 'Idiomatic modern C++',
        body: `
          <p>The big picture for writing modern C++:</p>
          <ul>
            <li>Use <code>std::vector</code>, <code>std::string</code>, smart pointers — almost never raw <code>new</code>.</li>
            <li>Pass by <code>const T&amp;</code> for non-trivial inputs; by value for cheap types.</li>
            <li>Prefer <code>auto</code> for clear local variables.</li>
            <li>Mark methods <code>const</code> when they don't mutate.</li>
            <li>Use range-based <code>for</code> over index loops.</li>
            <li>Make resources own their cleanup (RAII).</li>
            <li>Compile with warnings enabled (<code>-Wall -Wextra</code>) and fix them.</li>
          </ul>
        `,
        example: `#include <iostream>
#include <vector>
#include <string>

void printAll(const std::vector<std::string>& names) {
    for (const auto& n : names) std::cout << n << std::endl;
}

int main() {
    std::vector<std::string> names = {"Sam", "Ada", "Bjarne"};
    printAll(names);
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>void printDoubled(const std::vector&lt;int&gt;&amp; v)</code> that prints each element times 2 separated by spaces. Call with {1,2,3}.',
          starter: `#include <iostream>
#include <vector>

// define printDoubled

int main() {
    std::vector<int> v = {1, 2, 3};
    // call printDoubled(v)
    return 0;
}
`,
          expected: '2 4 6 \n',
          hint: 'for (auto x : v) std::cout << x*2 << " ";',
          solution: `#include <iostream>
#include <vector>
void printDoubled(const std::vector<int>& v) {
    for (auto x : v) std::cout << x * 2 << " ";
    std::cout << std::endl;
}
int main() {
    std::vector<int> v = {1, 2, 3};
    printDoubled(v);
    return 0;
}`
        }
      }
    ]
  },
  {
    id: 'm10',
    title: 'Capstone Projects',
    sub: 'Apply everything you learned.',
    lessons: [
      {
        id: 'l42',
        title: 'Number guessing game',
        body: `
          <p>Build a simple loop-driven game. The program has a secret number between 1 and 100. The player gets feedback "higher" / "lower" / "got it!".</p>
          <p>Skills used: variables, loops, conditionals, input.</p>
        `,
        example: `#include <iostream>

int main() {
    int secret = 42;
    int guess = 0;
    while (guess != secret) {
        std::cout << "Guess: ";
        std::cin >> guess;
        if (guess < secret) std::cout << "higher" << std::endl;
        else if (guess > secret) std::cout << "lower" << std::endl;
        else std::cout << "got it!" << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Given secret = 50, read 3 guesses from stdin. For each, print <code>higher</code>, <code>lower</code>, or <code>got it!</code>. Stop early if found.',
          starter: `#include <iostream>

int main() {
    int secret = 50;
    int guess;
    for (int i = 0; i < 3; ++i) {
        std::cin >> guess;
        // print response; break if equal
    }
    return 0;
}
`,
          expected: 'lower\nhigher\ngot it!\n',
          stdin: '70\n30\n50\n',
          hint: 'Use if/else inside the loop and break on equality.',
          solution: `#include <iostream>
int main() {
    int secret = 50, guess;
    for (int i = 0; i < 3; ++i) {
        std::cin >> guess;
        if (guess < secret) std::cout << "higher" << std::endl;
        else if (guess > secret) std::cout << "lower" << std::endl;
        else { std::cout << "got it!" << std::endl; break; }
    }
    return 0;
}`
        }
      },
      {
        id: 'l43',
        title: 'Mini calculator (class-based)',
        body: `
          <p>A class encapsulates a running total. Methods add, subtract, multiply, divide, and clear.</p>
          <p>Skills used: classes, methods, operators, basic I/O.</p>
        `,
        example: `#include <iostream>

class Calc {
    double total = 0;
public:
    void add(double x) { total += x; }
    void sub(double x) { total -= x; }
    void mul(double x) { total *= x; }
    double get() const { return total; }
};

int main() {
    Calc c;
    c.add(10); c.mul(3); c.sub(5);
    std::cout << c.get() << std::endl; // 25
    return 0;
}
`,
        exercise: {
          prompt: 'Using the Calc class above, do: add(7), mul(2), add(1), and print the total (should be 15).',
          starter: `#include <iostream>

class Calc {
    double total = 0;
public:
    void add(double x) { total += x; }
    void sub(double x) { total -= x; }
    void mul(double x) { total *= x; }
    double get() const { return total; }
};

int main() {
    Calc c;
    // sequence of operations, print get()
    return 0;
}
`,
          expected: '15\n',
          hint: 'c.add(7); c.mul(2); c.add(1);',
          solution: `#include <iostream>
class Calc { double total = 0; public:
    void add(double x){total+=x;} void sub(double x){total-=x;} void mul(double x){total*=x;}
    double get() const { return total; }
};
int main() {
    Calc c; c.add(7); c.mul(2); c.add(1);
    std::cout << c.get() << std::endl;
    return 0;
}`
        }
      },
      {
        id: 'l44',
        title: 'Where to go next',
        body: `
          <p>You now know the foundations: types, control flow, functions, references, OOP, templates, and modern idioms. Real mastery comes from writing real programs.</p>
          <h3>Pick a path</h3>
          <ul>
            <li><b>Systems</b> — write a tiny shell, a hash table, a memory allocator.</li>
            <li><b>Game dev</b> — try SFML or Raylib (great C++ bindings).</li>
            <li><b>Performance</b> — benchmark with <code>std::chrono</code>, profile, learn cache behavior.</li>
            <li><b>Modern C++</b> — read "A Tour of C++" by Bjarne Stroustrup.</li>
            <li><b>Compete</b> — try Codeforces or LeetCode in C++.</li>
          </ul>
          <h3>Build muscle</h3>
          <ul>
            <li>Install a real toolchain: <code>g++</code> or <code>clang++</code> on Linux/Mac, MSVC or MinGW on Windows.</li>
            <li>Learn CMake — the de-facto C++ build tool.</li>
            <li>Use a debugger (gdb, lldb, or your IDE's). Step through code. Set breakpoints.</li>
            <li>Read other people's code on GitHub.</li>
          </ul>
          <p>You're ready. Go ship something.</p>
        `,
        example: `#include <iostream>

int main() {
    std::cout << "I'm ready to ship." << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Final mile: print your own line of declaration. Print exactly <code>I am a C++ developer.</code>',
          starter: `#include <iostream>

int main() {
    // declare it
    return 0;
}
`,
          expected: 'I am a C++ developer.\n',
          hint: 'std::cout << "I am a C++ developer." << std::endl;',
          solution: `#include <iostream>
int main() {
    std::cout << "I am a C++ developer." << std::endl;
    return 0;
}`
        }
      }
    ]
  }
];

const PRACTICE = [
  {
    id: 'p1',
    title: 'Sum of two',
    diff: 'easy',
    prompt: 'Read two ints from stdin. Print their sum on one line.',
    starter: `#include <iostream>
int main() {
    int a, b;
    std::cin >> a >> b;
    // print a + b
    return 0;
}
`,
    expected: '11\n',
    stdin: '4\n7\n',
    solution: `#include <iostream>
int main() { int a, b; std::cin >> a >> b; std::cout << a + b << std::endl; return 0; }`
  },
  {
    id: 'p2',
    title: 'FizzBuzz to 15',
    diff: 'easy',
    prompt: 'Print 1..15. Multiples of 3 become Fizz, multiples of 5 become Buzz, multiples of both become FizzBuzz. One per line.',
    starter: `#include <iostream>
int main() {
    for (int i = 1; i <= 15; ++i) {
        // logic
    }
    return 0;
}
`,
    expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n',
    solution: `#include <iostream>
int main() {
    for (int i = 1; i <= 15; ++i) {
        if (i % 15 == 0) std::cout << "FizzBuzz" << std::endl;
        else if (i % 3 == 0) std::cout << "Fizz" << std::endl;
        else if (i % 5 == 0) std::cout << "Buzz" << std::endl;
        else std::cout << i << std::endl;
    }
    return 0;
}`
  },
  {
    id: 'p3',
    title: 'Reverse a number',
    diff: 'easy',
    prompt: 'Read a positive int. Print its digits reversed. Example: 1234 -> 4321',
    starter: `#include <iostream>
int main() {
    int n;
    std::cin >> n;
    // print reversed digits
    return 0;
}
`,
    expected: '4321\n',
    stdin: '1234\n',
    solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    int r = 0;
    while (n > 0) { r = r * 10 + n % 10; n /= 10; }
    std::cout << r << std::endl;
    return 0;
}`
  },
  {
    id: 'p4',
    title: 'Count vowels',
    diff: 'easy',
    prompt: 'Read a single word. Print the count of vowels (aeiou, lowercase).',
    starter: `#include <iostream>
#include <string>
int main() {
    std::string s;
    std::cin >> s;
    // count aeiou
    return 0;
}
`,
    expected: '3\n',
    stdin: 'developer\n',
    solution: `#include <iostream>
#include <string>
int main() {
    std::string s; std::cin >> s;
    int c = 0;
    for (char ch : s) if (ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u') c++;
    std::cout << c << std::endl;
    return 0;
}`
  },
  {
    id: 'p5',
    title: 'Maximum of N',
    diff: 'medium',
    prompt: 'Read int n, then n ints. Print the largest.',
    starter: `#include <iostream>
int main() {
    int n;
    std::cin >> n;
    // find max
    return 0;
}
`,
    expected: '99\n',
    stdin: '5\n3\n99\n12\n4\n7\n',
    solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    int m, x;
    std::cin >> m;
    for (int i = 1; i < n; ++i) { std::cin >> x; if (x > m) m = x; }
    std::cout << m << std::endl;
    return 0;
}`
  },
  {
    id: 'p6',
    title: 'Prime check',
    diff: 'medium',
    prompt: 'Read int n. Print "prime" or "not prime". (n >= 2)',
    starter: `#include <iostream>
int main() {
    int n;
    std::cin >> n;
    // primality
    return 0;
}
`,
    expected: 'prime\n',
    stdin: '17\n',
    solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    bool prime = n >= 2;
    for (int i = 2; (long long)i*i <= n; ++i) if (n % i == 0) { prime = false; break; }
    std::cout << (prime ? "prime" : "not prime") << std::endl;
    return 0;
}`
  },
  {
    id: 'p7',
    title: 'Fibonacci nth',
    diff: 'medium',
    prompt: 'Read int n (0..30). Print fib(n) where fib(0)=0, fib(1)=1.',
    starter: `#include <iostream>
int main() {
    int n;
    std::cin >> n;
    // print fib(n)
    return 0;
}
`,
    expected: '55\n',
    stdin: '10\n',
    solution: `#include <iostream>
int main() {
    int n; std::cin >> n;
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) { long long t = a + b; a = b; b = t; }
    std::cout << a << std::endl;
    return 0;
}`
  },
  {
    id: 'p8',
    title: 'Palindrome word',
    diff: 'medium',
    prompt: 'Read a word. Print "yes" if palindrome, else "no". (case-sensitive)',
    starter: `#include <iostream>
#include <string>
int main() {
    std::string s;
    std::cin >> s;
    // check palindrome
    return 0;
}
`,
    expected: 'yes\n',
    stdin: 'racecar\n',
    solution: `#include <iostream>
#include <string>
int main() {
    std::string s; std::cin >> s;
    bool pal = true;
    for (int i = 0, j = s.size() - 1; i < j; ++i, --j) if (s[i] != s[j]) { pal = false; break; }
    std::cout << (pal ? "yes" : "no") << std::endl;
    return 0;
}`
  },
  {
    id: 'p9',
    title: 'GCD (Euclidean)',
    diff: 'hard',
    prompt: 'Read two positive ints. Print their gcd.',
    starter: `#include <iostream>
int main() {
    int a, b;
    std::cin >> a >> b;
    // print gcd
    return 0;
}
`,
    expected: '6\n',
    stdin: '24\n18\n',
    solution: `#include <iostream>
int main() {
    int a, b; std::cin >> a >> b;
    while (b) { int t = a % b; a = b; b = t; }
    std::cout << a << std::endl;
    return 0;
}`
  },
  {
    id: 'p10',
    title: 'Bubble sort 5 ints',
    diff: 'hard',
    prompt: 'Read 5 ints. Print them sorted ascending, space-separated, ending with space and newline.',
    starter: `#include <iostream>
int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    // sort and print
    return 0;
}
`,
    expected: '1 2 3 4 5 \n',
    stdin: '4\n2\n5\n1\n3\n',
    solution: `#include <iostream>
int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    for (int i = 0; i < 5; ++i)
        for (int j = i + 1; j < 5; ++j)
            if (a[j] < a[i]) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    for (int i = 0; i < 5; ++i) std::cout << a[i] << " ";
    std::cout << std::endl;
    return 0;
}`
  }
];

const REFERENCE = [
  {
    title: 'I/O basics',
    items: [
      { code: '#include <iostream>', desc: 'Pull in cin / cout / cerr.' },
      { code: 'std::cout << x << std::endl;', desc: 'Print x and flush.' },
      { code: 'std::cin >> x;', desc: 'Read whitespace-separated value into x.' },
      { code: 'std::getline(std::cin, s);', desc: 'Read whole line into std::string s.' }
    ]
  },
  {
    title: 'Types',
    items: [
      { code: 'int / long / long long', desc: 'Whole numbers (32 / 32+ / 64 bit).' },
      { code: 'float / double', desc: 'Decimals; double is the default.' },
      { code: 'char / bool', desc: 'Single character / true|false.' },
      { code: 'std::string', desc: 'Text (#include <string>).' },
      { code: 'auto x = expr;', desc: 'Let the compiler deduce the type.' }
    ]
  },
  {
    title: 'Control flow',
    items: [
      { code: 'if (c) { } else if (d) { } else { }', desc: 'Branch.' },
      { code: 'switch (v) { case k: ... break; default: ... }', desc: 'Multi-branch on integer/char.' },
      { code: 'for (int i = 0; i < n; ++i) { }', desc: 'Counted loop.' },
      { code: 'while (c) { }   /   do { } while (c);', desc: 'Conditional loops.' },
      { code: 'for (auto& x : container) { }', desc: 'Range-based loop.' }
    ]
  },
  {
    title: 'Functions',
    items: [
      { code: 'T name(Args...) { ... }', desc: 'Definition.' },
      { code: 'void f(int& x);', desc: 'Pass by reference (modifies caller).' },
      { code: 'void f(const T& x);', desc: 'Read-only reference; cheap for big T.' },
      { code: 'T g(int x = 0);', desc: 'Default argument.' },
      { code: 'template <typename T> T h(T a) { ... }', desc: 'Function template.' }
    ]
  },
  {
    title: 'Pointers & memory',
    items: [
      { code: 'int* p = &x;   *p = 42;', desc: 'Address of, dereference.' },
      { code: 'nullptr', desc: 'A pointer that points to nothing.' },
      { code: 'int* a = new int[n]; ... delete[] a;', desc: 'Heap array; pair every new[] with delete[].' },
      { code: 'std::unique_ptr<T> p(new T(...));', desc: 'Single-owner smart pointer.' },
      { code: 'std::shared_ptr<T> p = std::make_shared<T>(...);', desc: 'Reference-counted.' }
    ]
  },
  {
    title: 'Containers',
    items: [
      { code: 'std::vector<T> v;', desc: 'Dynamic array — your default container.' },
      { code: 'v.push_back(x); v.size(); v[i];', desc: 'Add / count / index.' },
      { code: 'std::string s = "hi";', desc: 'Text. Concatenate with +.' },
      { code: 'std::map<K, V>;', desc: 'Sorted key/value (#include <map>).' },
      { code: 'std::set<T>;', desc: 'Sorted unique values (#include <set>).' }
    ]
  },
  {
    title: 'Classes',
    items: [
      { code: 'class C { public: ... private: ... };', desc: 'Default access is private.' },
      { code: 'C() : member(value) { }', desc: 'Member initializer list.' },
      { code: '~C() { }', desc: 'Destructor — runs on scope exit.' },
      { code: 'class D : public B { };', desc: 'Public inheritance.' },
      { code: 'virtual void f() = 0;', desc: 'Pure virtual — abstract method.' },
      { code: 'void f() const override;', desc: 'Override base virtual; const = no mutation.' }
    ]
  },
  {
    title: 'Modern idioms',
    items: [
      { code: 'auto sum = [&](int x) { return total + x; };', desc: 'Lambda capturing total by reference.' },
      { code: 'std::move(x)', desc: 'Cast to rvalue — allows move (transfer of ownership).' },
      { code: 'auto& el : container', desc: 'Reference each element — no copy.' },
      { code: '#include <algorithm>', desc: 'std::sort, std::find, std::count, std::for_each…' }
    ]
  }
];

const BADGES = [
  { id: 'first',     name: 'First Steps',    icon: '🐣', test: (s) => s.lessonsDone >= 1 },
  { id: 'm1',        name: 'Foundations',    icon: '🧱', test: (s) => s.modulesDone >= 1 },
  { id: 'control',   name: 'In Control',     icon: '🎛️', test: (s) => s.modulesDone >= 2 },
  { id: 'fn',        name: 'Function Pro',   icon: '🔧', test: (s) => s.modulesDone >= 3 },
  { id: 'collector', name: 'Collector',      icon: '📦', test: (s) => s.modulesDone >= 4 },
  { id: 'pointers',  name: 'Pointer Wizard', icon: '🪄', test: (s) => s.modulesDone >= 5 },
  { id: 'oop',       name: 'OO Architect',   icon: '🏛️', test: (s) => s.modulesDone >= 6 },
  { id: 'poly',      name: 'Polyglot',       icon: '🦎', test: (s) => s.modulesDone >= 7 },
  { id: 'tmpl',      name: 'Template Master',icon: '🧬', test: (s) => s.modulesDone >= 8 },
  { id: 'modern',    name: 'Modernist',      icon: '🚀', test: (s) => s.modulesDone >= 9 },
  { id: 'cap',       name: 'Capstone',       icon: '🎓', test: (s) => s.modulesDone >= 10 },
  { id: 'practice5', name: 'Practitioner',   icon: '🎯', test: (s) => s.practiceDone >= 5 }
];

const TEMPLATES = {
  hello: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
  vars: `#include <iostream>

int main() {
    int    a = 7, b = 3;
    double pi = 3.14159;
    std::cout << "a + b = " << a + b << std::endl;
    std::cout << "a / b (int)    = " << a / b << std::endl;
    std::cout << "a / b (double) = " << (double)a / b << std::endl;
    std::cout << "pi * 2 = " << pi * 2 << std::endl;
    return 0;
}
`,
  loop: `#include <iostream>

int main() {
    int n = 10, sum = 0;
    for (int i = 1; i <= n; ++i) sum += i;
    std::cout << "Sum 1.." << n << " = " << sum << std::endl;
    return 0;
}
`,
  vector: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    for (int i = 1; i <= 5; ++i) v.push_back(i * i);
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`,
  class: `#include <iostream>
#include <string>

class Greeter {
    std::string who;
public:
    Greeter(std::string n) : who(n) {}
    void greet() const {
        std::cout << "Hello, " << who << "!" << std::endl;
    }
};

int main() {
    Greeter g("C++ developer");
    g.greet();
    return 0;
}
`,
  fizz: `#include <iostream>

int main() {
    for (int i = 1; i <= 30; ++i) {
        if (i % 15 == 0)      std::cout << "FizzBuzz" << std::endl;
        else if (i % 3 == 0)  std::cout << "Fizz" << std::endl;
        else if (i % 5 == 0)  std::cout << "Buzz" << std::endl;
        else                  std::cout << i << std::endl;
    }
    return 0;
}
`,
  prime: `#include <iostream>

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; (long long)i * i <= n; ++i)
        if (n % i == 0) return false;
    return true;
}

int main() {
    for (int i = 2; i <= 30; ++i)
        if (isPrime(i)) std::cout << i << " ";
    std::cout << std::endl;
    return 0;
}
`,
  sort: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 9, 1, 7, 3};
    // simple insertion sort
    for (int i = 1; i < (int)v.size(); ++i) {
        int key = v[i], j = i - 1;
        while (j >= 0 && v[j] > key) { v[j + 1] = v[j]; --j; }
        v[j + 1] = key;
    }
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`
};
