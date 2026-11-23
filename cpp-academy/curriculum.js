/* Course content.
 *
 * Lesson:   { id, title, body (HTML), example, exampleStdin?, exercise? }
 * Exercise: { prompt (HTML), starter, solution, hint, tests: [{ stdin?, expected }] }
 *
 * An exercise passes when the program's output matches `expected` for every
 * test. The first test is shown to the learner; the others are there so that
 * printing the expected answer directly doesn't pass.
 *
 * IDs are stored in learners' saved progress, so don't renumber them.
 * Code lives in JS template literals: write '\\n' or use std::endl, never a
 * bare "\n", and avoid "${".
 */

const MODULES = [
  {
    id: 'm1',
    title: 'Foundations',
    sub: 'Output, variables, constants, and input',
    lessons: [
      {
        id: 'l1',
        title: 'Hello, World!',
        body: `
          <p>C++ is a compiled, general-purpose language used for games, browsers, databases, trading systems, and embedded devices. A compiler turns your source code into a program the machine can run directly, which is a big part of why C++ is fast.</p>
          <p>Every C++ program starts running in a function called <code>main</code>.</p>
          <h3>Anatomy of a program</h3>
          <ul>
            <li><code>#include &lt;iostream&gt;</code> brings in the standard input/output library.</li>
            <li><code>int main()</code> is the entry point. Execution starts at its opening brace.</li>
            <li><code>std::cout</code> is the standard output stream, and <code>&lt;&lt;</code> sends a value to it.</li>
            <li><code>std::endl</code> writes a newline and flushes the output.</li>
            <li><code>return 0;</code> reports to the operating system that the program succeeded.</li>
          </ul>
          <div class="callout">Each statement ends with a semicolon. A missing semicolon is one of the most common compile errors, and the compiler often reports it on the line <i>after</i> the real mistake.</div>
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
          tests: [{ expected: 'Hello, C++!\n' }],
          hint: 'std::cout << "Hello, C++!" << std::endl;',
          solution: `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l2',
        title: 'Variables and basic types',
        body: `
          <p>C++ is statically typed: every variable has a type that is fixed when the program is compiled. The type tells the compiler how much memory the value needs and which operations make sense on it, so many mistakes are caught before the program ever runs.</p>
          <h3>Common types</h3>
          <ul>
            <li><code>int</code>: whole numbers, such as <code>42</code> or <code>-7</code></li>
            <li><code>double</code>: numbers with a fractional part, such as <code>3.14</code></li>
            <li><code>char</code>: a single character in single quotes, such as <code>'A'</code></li>
            <li><code>bool</code>: <code>true</code> or <code>false</code></li>
            <li><code>std::string</code>: text in double quotes (needs <code>#include &lt;string&gt;</code>)</li>
          </ul>
          <p>Declare a variable with <code>type name = value;</code>. Always give a variable a value before you read it: reading an uninitialized <code>int</code> gives you whatever happened to be in memory.</p>
          <p>Notice that <code>bool</code> prints as <code>1</code> or <code>0</code>. Send <code>std::boolalpha</code> to the stream first if you want <code>true</code> and <code>false</code>.</p>
        `,
        example: `#include <iostream>
#include <string>

int main() {
    int age = 21;
    double pi = 3.14159;
    char grade = 'A';
    bool ready = true;
    std::string name = "Sam";

    std::cout << name << " is " << age << " years old." << std::endl;
    std::cout << "Pi is about " << pi << ", grade " << grade << std::endl;
    std::cout << "Ready? " << ready << std::endl;
    std::cout << "Ready? " << std::boolalpha << ready << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Declare an <code>int</code> called <code>year</code> set to 2026 and print: <code>Year: 2026</code>',
          starter: `#include <iostream>

int main() {
    // Declare year and print it
    return 0;
}
`,
          tests: [{ expected: 'Year: 2026\n' }],
          hint: 'int year = 2026; then std::cout << "Year: " << year << std::endl;',
          solution: `#include <iostream>

int main() {
    int year = 2026;
    std::cout << "Year: " << year << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l3',
        title: 'Constants',
        body: `
          <p>Mark a variable <code>const</code> when its value should never change after it is initialized. The compiler then rejects any attempt to modify it, and anyone reading the code knows the value is fixed.</p>
          <p><code>constexpr</code> is stricter: the value must be computable at compile time. Use it for true constants such as array sizes or conversion factors.</p>
          <div class="callout">A good default is to make a variable <code>const</code> unless you know it needs to change. Fewer moving parts means fewer bugs.</div>
        `,
        example: `#include <iostream>

int main() {
    constexpr double TAX_RATE = 0.08;
    const double price = 19.99;
    const double total = price * (1 + TAX_RATE);
    std::cout << "Total: " << total << std::endl;
    // TAX_RATE = 0.10;  // error: assignment of read-only variable
    return 0;
}
`,
        exercise: {
          prompt: 'Declare <code>const int LIMIT = 100;</code> and print: <code>Limit is 100</code>',
          starter: `#include <iostream>

int main() {
    // Declare LIMIT and print it
    return 0;
}
`,
          tests: [{ expected: 'Limit is 100\n' }],
          hint: 'const int LIMIT = 100;',
          solution: `#include <iostream>

int main() {
    const int LIMIT = 100;
    std::cout << "Limit is " << LIMIT << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l4',
        title: 'Reading input with cin',
        body: `
          <p><code>std::cin</code> reads from standard input. The <code>&gt;&gt;</code> operator reads one value and stores it in a variable.</p>
          <p><code>&gt;&gt;</code> skips spaces and newlines and stops at the next one, so <code>std::cin &gt;&gt; name</code> reads a single word. To read a whole line including spaces, use <code>std::getline(std::cin, line)</code>.</p>
          <div class="callout">Programs here can't ask you questions while they run. Put all the input in the <b>Input</b> box before you press Run; the program reads from it as if you had typed it.</div>
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
        exampleStdin: 'Sam 21\n',
        exercise: {
          prompt: 'Read two integers <code>a</code> and <code>b</code> and print their sum on one line.',
          starter: `#include <iostream>

int main() {
    int a, b;
    // Read a and b, then print a + b
    return 0;
}
`,
          tests: [
            { stdin: '5 7\n', expected: '12\n' },
            { stdin: '-3 10\n', expected: '7\n' }
          ],
          hint: 'std::cin >> a >> b; then std::cout << a + b << std::endl;',
          solution: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    std::cout << a + b << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l5',
        title: 'Operators and expressions',
        body: `
          <p><b>Arithmetic:</b> <code>+ - * / %</code>. When both operands are integers, <code>/</code> drops the fractional part, so <code>7 / 2</code> is <code>3</code>. Convert one operand to <code>double</code> with <code>static_cast&lt;double&gt;(x)</code> to get <code>3.5</code>. The remainder operator <code>%</code> only works on integers.</p>
          <p><b>Comparison:</b> <code>== != &lt; &lt;= &gt; &gt;=</code> produce a <code>bool</code>. Be careful not to write <code>=</code> (assignment) when you mean <code>==</code>.</p>
          <p><b>Logical:</b> <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not). <code>&amp;&amp;</code> and <code>||</code> stop evaluating as soon as the answer is known.</p>
          <p><b>Increment:</b> <code>++x</code> and <code>x++</code> both add 1 to <code>x</code>. The difference is the value of the expression: <code>++x</code> gives the new value, <code>x++</code> gives the old one.</p>
        `,
        example: `#include <iostream>

int main() {
    int a = 7, b = 2;
    std::cout << a / b << std::endl;                       // 3
    std::cout << static_cast<double>(a) / b << std::endl;  // 3.5
    std::cout << a % b << std::endl;                       // 1
    std::cout << (a > b && a < 10) << std::endl;           // 1 (true)

    int x = 5;
    int y = x++;   // y gets 5, then x becomes 6
    int z = ++x;   // x becomes 7, then z gets 7
    std::cout << x << " " << y << " " << z << std::endl;   // 7 5 7
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code>. Print <code>even</code> if it is divisible by 2, otherwise <code>odd</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Print "even" or "odd"
    return 0;
}
`,
          tests: [
            { stdin: '8\n', expected: 'even\n' },
            { stdin: '7\n', expected: 'odd\n' },
            { stdin: '0\n', expected: 'even\n' }
          ],
          hint: 'n % 2 == 0 is true for even numbers.',
          solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    if (n % 2 == 0) {
        std::cout << "even" << std::endl;
    } else {
        std::cout << "odd" << std::endl;
    }
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm2',
    title: 'Control flow',
    sub: 'Branches and loops',
    lessons: [
      {
        id: 'l6',
        title: 'if, else if, else',
        body: `
          <p>An <code>if</code> statement runs its body only when its condition is <code>true</code>. Chain alternatives with <code>else if</code>, and catch everything else with <code>else</code>. Conditions are checked from top to bottom and only the first matching branch runs.</p>
          <pre class="code"><span class="kw">if</span> (cond1) { ... }
<span class="kw">else if</span> (cond2) { ... }
<span class="kw">else</span> { ... }</pre>
          <p>Use braces even when a branch is a single line. Without them, a second line added later looks like part of the branch but isn't.</p>
        `,
        example: `#include <iostream>

int main() {
    int score = 78;
    if (score >= 90) {
        std::cout << "A" << std::endl;
    } else if (score >= 80) {
        std::cout << "B" << std::endl;
    } else if (score >= 70) {
        std::cout << "C" << std::endl;
    } else {
        std::cout << "F" << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Read two ints and print the larger one. If they are equal, print that value.',
          starter: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    // Print the larger value
    return 0;
}
`,
          tests: [
            { stdin: '15 9\n', expected: '15\n' },
            { stdin: '4 11\n', expected: '11\n' },
            { stdin: '6 6\n', expected: '6\n' }
          ],
          hint: 'if (a > b) print a, else print b.',
          solution: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    if (a > b) {
        std::cout << a << std::endl;
    } else {
        std::cout << b << std::endl;
    }
    return 0;
}
`
        }
      },
      {
        id: 'l7',
        title: 'switch',
        body: `
          <p>A <code>switch</code> jumps to the <code>case</code> whose value equals the expression. It works with integers, characters, and enums, not strings.</p>
          <p>End each case with <code>break;</code>. Without it, execution "falls through" and keeps running the next case's code too. The <code>default</code> label handles any value that no case matched.</p>
        `,
        example: `#include <iostream>

int main() {
    char op = '+';
    int a = 4, b = 3;
    switch (op) {
        case '+': std::cout << a + b << std::endl; break;
        case '-': std::cout << a - b << std::endl; break;
        case '*': std::cout << a * b << std::endl; break;
        default:  std::cout << "unknown operator" << std::endl; break;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int. Print <code>one</code>, <code>two</code>, or <code>three</code> for 1, 2, or 3, and <code>?</code> for anything else. Use a <code>switch</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // switch on n
    return 0;
}
`,
          tests: [
            { stdin: '2\n', expected: 'two\n' },
            { stdin: '3\n', expected: 'three\n' },
            { stdin: '9\n', expected: '?\n' }
          ],
          hint: 'switch (n) { case 1: ...; break; case 2: ...; break; default: ...; }',
          solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    switch (n) {
        case 1: std::cout << "one" << std::endl; break;
        case 2: std::cout << "two" << std::endl; break;
        case 3: std::cout << "three" << std::endl; break;
        default: std::cout << "?" << std::endl; break;
    }
    return 0;
}
`
        }
      },
      {
        id: 'l8',
        title: 'while and do-while',
        body: `
          <p>A <code>while</code> loop checks its condition <i>before</i> each pass, so its body may run zero times. A <code>do { ... } while (cond);</code> loop checks <i>after</i> each pass, so its body always runs at least once.</p>
          <div class="callout">Something in the loop body has to eventually make the condition false. If nothing does, the loop runs forever.</div>
        `,
        example: `#include <iostream>

int main() {
    int n = 1;
    while (n <= 5) {
        std::cout << n << " ";
        n++;
    }
    std::cout << std::endl;

    int runs = 0;
    do {
        runs++;
    } while (runs < 0);  // false right away, but the body already ran once
    std::cout << "do-while body ran " << runs << " time" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code>, then print the integers from 1 to <code>n</code> separated by spaces, followed by a newline.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Print 1..n separated by spaces
    return 0;
}
`,
          tests: [
            { stdin: '5\n', expected: '1 2 3 4 5\n' },
            { stdin: '3\n', expected: '1 2 3\n' }
          ],
          hint: 'int i = 1; while (i <= n) { std::cout << i << " "; i++; }',
          solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    int i = 1;
    while (i <= n) {
        std::cout << i << " ";
        i++;
    }
    std::cout << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l9',
        title: 'for loops',
        body: `
          <p>A <code>for</code> loop puts the setup, the condition, and the update on one line. It is the natural choice when you are counting.</p>
          <pre class="code"><span class="kw">for</span> (<span class="ty">int</span> i = 0; i &lt; 10; ++i) { ... }</pre>
          <p>The variable <code>i</code> only exists inside the loop. C++ also has a range-based <code>for</code> for walking through collections, which comes up in the next module.</p>
        `,
        example: `#include <iostream>

int main() {
    int sum = 0;
    for (int i = 1; i <= 10; ++i) {
        sum += i;
    }
    std::cout << "Sum of 1..10 = " << sum << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code> and print the sum of all integers from 1 to <code>n</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Print the sum of 1..n
    return 0;
}
`,
          tests: [
            { stdin: '10\n', expected: '55\n' },
            { stdin: '4\n', expected: '10\n' }
          ],
          hint: 'int sum = 0; for (int i = 1; i <= n; ++i) sum += i;',
          solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    int sum = 0;
    for (int i = 1; i <= n; ++i) {
        sum += i;
    }
    std::cout << sum << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l10',
        title: 'break and continue',
        body: `
          <p><code>break</code> leaves the innermost loop (or <code>switch</code>) immediately. <code>continue</code> skips the rest of the current pass and moves on to the next one.</p>
          <p>Both are useful, but a loop with many of them gets hard to follow. If you find yourself adding several, consider rewriting the condition instead.</p>
        `,
        example: `#include <iostream>

int main() {
    for (int i = 1; i <= 10; ++i) {
        if (i == 7) break;          // stop the loop entirely
        if (i % 2 == 0) continue;   // skip even numbers
        std::cout << i << " ";
    }
    std::cout << std::endl;         // prints 1 3 5
    return 0;
}
`,
        exercise: {
          prompt: 'Print the numbers from 1 to 20, skipping multiples of 3, separated by spaces.',
          starter: `#include <iostream>

int main() {
    for (int i = 1; i <= 20; ++i) {
        // Skip multiples of 3
    }
    std::cout << std::endl;
    return 0;
}
`,
          tests: [{ expected: '1 2 4 5 7 8 10 11 13 14 16 17 19 20\n' }],
          hint: 'if (i % 3 == 0) continue;',
          solution: `#include <iostream>

int main() {
    for (int i = 1; i <= 20; ++i) {
        if (i % 3 == 0) continue;
        std::cout << i << " ";
    }
    std::cout << std::endl;
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm3',
    title: 'Functions',
    sub: 'Parameters, return values, references, recursion',
    lessons: [
      {
        id: 'l11',
        title: 'Defining functions',
        body: `
          <p>A function gives a name to a piece of logic so you can reuse it. It has a return type, a name, and a parameter list: <code>int square(int x)</code>. A function that returns nothing has return type <code>void</code>.</p>
          <p>The compiler reads a file from top to bottom, so a function must be declared before it is called. You can put a short declaration (a prototype) above <code>main</code> and the full definition below it, as the example does.</p>
        `,
        example: `#include <iostream>

int square(int x);  // declaration: name, parameters, return type

int main() {
    std::cout << square(5) << std::endl;
    std::cout << square(9) << std::endl;
    return 0;
}

int square(int x) {  // definition: the body
    return x * x;
}
`,
        exercise: {
          prompt: 'Write a function <code>int cube(int x)</code> that returns <code>x * x * x</code>. Read an int and print its cube.',
          starter: `#include <iostream>

// Define cube here

int main() {
    int n;
    std::cin >> n;
    // Print cube(n)
    return 0;
}
`,
          tests: [
            { stdin: '3\n', expected: '27\n' },
            { stdin: '-2\n', expected: '-8\n' }
          ],
          hint: 'int cube(int x) { return x * x * x; }',
          solution: `#include <iostream>

int cube(int x) {
    return x * x * x;
}

int main() {
    int n;
    std::cin >> n;
    std::cout << cube(n) << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l12',
        title: 'Pass by value and by reference',
        body: `
          <p>By default a function receives a <b>copy</b> of each argument. Changing the parameter inside the function does not affect the caller's variable.</p>
          <p>Add <code>&amp;</code> to the parameter type to pass by <b>reference</b>. The parameter then refers to the caller's variable itself, so changes are visible outside.</p>
          <p>For large objects such as strings and vectors, <code>const T&amp;</code> avoids the cost of a copy while still preventing the function from changing the argument.</p>
        `,
        example: `#include <iostream>

void addOne(int x)     { x += 1; }  // changes a local copy
void addOneRef(int& x) { x += 1; }  // changes the caller's variable

int main() {
    int a = 5;
    addOne(a);
    std::cout << a << std::endl;  // 5
    addOneRef(a);
    std::cout << a << std::endl;  // 6
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>void doubleIt(int&amp; x)</code> that doubles <code>x</code> in place. Read an int, call <code>doubleIt</code> on it, and print it.',
          starter: `#include <iostream>

// Define doubleIt here

int main() {
    int n;
    std::cin >> n;
    // Call doubleIt(n), then print n
    return 0;
}
`,
          tests: [
            { stdin: '7\n', expected: '14\n' },
            { stdin: '-5\n', expected: '-10\n' }
          ],
          hint: 'void doubleIt(int& x) { x *= 2; }',
          solution: `#include <iostream>

void doubleIt(int& x) {
    x *= 2;
}

int main() {
    int n;
    std::cin >> n;
    doubleIt(n);
    std::cout << n << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l13',
        title: 'Default arguments and overloading',
        body: `
          <p>A parameter can have a default value: <code>void greet(std::string name = "friend")</code>. Callers may then leave that argument out. Defaults must come at the end of the parameter list.</p>
          <p>Several functions can share a name if their parameter lists differ in number or types. This is called <b>overloading</b>, and the compiler picks the version that best matches the arguments. Functions that differ only in return type can't be overloaded.</p>
        `,
        example: `#include <iostream>
#include <string>

void greet(const std::string& name = "friend") {
    std::cout << "Hi, " << name << std::endl;
}

int add(int a, int b)          { return a + b; }
double add(double a, double b) { return a + b; }

int main() {
    greet();
    greet("Sam");
    std::cout << add(1, 2) << std::endl;      // calls the int version
    std::cout << add(1.5, 2.25) << std::endl; // calls the double version
    return 0;
}
`,
        exercise: {
          prompt: 'Write two overloads: <code>int largest(int a, int b)</code> and <code>int largest(int a, int b, int c)</code>. Read three ints and print <code>largest(a, b, c)</code>.',
          starter: `#include <iostream>

// Define both overloads of largest here

int main() {
    int a, b, c;
    std::cin >> a >> b >> c;
    // Print largest(a, b, c)
    return 0;
}
`,
          tests: [
            { stdin: '4 12 7\n', expected: '12\n' },
            { stdin: '9 2 3\n', expected: '9\n' },
            { stdin: '1 5 8\n', expected: '8\n' }
          ],
          hint: 'The three-argument version can call the two-argument one twice.',
          solution: `#include <iostream>

int largest(int a, int b) {
    return a > b ? a : b;
}

int largest(int a, int b, int c) {
    return largest(largest(a, b), c);
}

int main() {
    int a, b, c;
    std::cin >> a >> b >> c;
    std::cout << largest(a, b, c) << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l14',
        title: 'Recursion',
        body: `
          <p>A function that calls itself is <b>recursive</b>. Each call works on a smaller version of the problem until it reaches a <i>base case</i> that can be answered directly.</p>
          <p>Without a base case the calls never stop, and the program eventually runs out of stack space and crashes.</p>
          <p>The classic example is factorial: <code>n! = n × (n-1)!</code>, with <code>0! = 1</code>.</p>
        `,
        example: `#include <iostream>

int factorial(int n) {
    if (n <= 1) return 1;            // base case
    return n * factorial(n - 1);     // smaller problem
}

int main() {
    std::cout << factorial(5) << std::endl;  // 120
    return 0;
}
`,
        exercise: {
          prompt: 'Write a recursive <code>int sumTo(int n)</code> that returns 1 + 2 + ... + n (and 0 when n is 0). Read n and print the result.',
          starter: `#include <iostream>

// Define a recursive sumTo here

int main() {
    int n;
    std::cin >> n;
    // Print sumTo(n)
    return 0;
}
`,
          tests: [
            { stdin: '5\n', expected: '15\n' },
            { stdin: '1\n', expected: '1\n' },
            { stdin: '0\n', expected: '0\n' }
          ],
          hint: 'Base case: n <= 0 returns 0. Otherwise return n + sumTo(n - 1).',
          solution: `#include <iostream>

int sumTo(int n) {
    if (n <= 0) return 0;
    return n + sumTo(n - 1);
}

int main() {
    int n;
    std::cin >> n;
    std::cout << sumTo(n) << std::endl;
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm4',
    title: 'Collections and strings',
    sub: 'Arrays, std::string, and std::vector',
    lessons: [
      {
        id: 'l15',
        title: 'Arrays',
        body: `
          <p>A built-in array is a fixed-size block of elements of one type. The size must be known at compile time, and indexes start at 0.</p>
          <pre class="code"><span class="ty">int</span> a[5] = {10, 20, 30, 40, 50};
a[0];  <span class="cm">// 10</span>
a[4];  <span class="cm">// 50, the last element</span></pre>
          <p>When you pass an array to a function it turns into a pointer to its first element and loses its size, so you usually have to pass the length separately. C++ does not check indexes: reading or writing past the end is undefined behavior, which means anything can happen.</p>
        `,
        example: `#include <iostream>

int main() {
    int nums[5] = {3, 1, 4, 1, 5};
    int sum = 0;
    for (int i = 0; i < 5; ++i) {
        sum += nums[i];
    }
    std::cout << "sum = " << sum << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read 5 ints into an array, then print the largest.',
          starter: `#include <iostream>

int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    // Find and print the largest value
    return 0;
}
`,
          tests: [
            { stdin: '3 9 2 7 4\n', expected: '9\n' },
            { stdin: '-4 -8 -1 -6 -3\n', expected: '-1\n' }
          ],
          hint: 'Start with int best = a[0]; then compare against each remaining element.',
          solution: `#include <iostream>

int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    int best = a[0];
    for (int i = 1; i < 5; ++i) {
        if (a[i] > best) best = a[i];
    }
    std::cout << best << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l16',
        title: 'std::string',
        body: `
          <p><code>std::string</code> holds text and manages its own memory, so it can grow as needed. Join strings with <code>+</code>, get the length with <code>.size()</code>, and read or change a single character with <code>[i]</code>.</p>
          <p><code>std::cin &gt;&gt; s</code> reads one word. <code>std::getline(std::cin, s)</code> reads a whole line.</p>
        `,
        example: `#include <iostream>
#include <string>

int main() {
    std::string a = "Hello", b = "C++";
    std::string c = a + ", " + b + "!";
    std::cout << c << " (" << c.size() << " characters)" << std::endl;
    std::cout << "First character: " << c[0] << std::endl;
    c[0] = 'J';
    std::cout << c << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read a word and print its length.',
          starter: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    // Print the length of s
    return 0;
}
`,
          tests: [
            { stdin: 'hello\n', expected: '5\n' },
            { stdin: 'pointer\n', expected: '7\n' }
          ],
          hint: 'std::cout << s.size() << std::endl;',
          solution: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    std::cout << s.size() << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l17',
        title: 'std::vector',
        body: `
          <p><code>std::vector&lt;T&gt;</code> is a resizable array. It keeps track of its own size and grows when you add elements.</p>
          <ul>
            <li><code>v.push_back(x)</code> adds <code>x</code> to the end</li>
            <li><code>v.size()</code> returns the number of elements</li>
            <li><code>v[i]</code> accesses element <code>i</code> (unchecked, like an array)</li>
            <li><code>v.empty()</code> is true when there are no elements</li>
          </ul>
          <p>In modern C++, reach for <code>std::vector</code> by default whenever you need a list of things.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    for (int i = 1; i <= 5; ++i) {
        v.push_back(i * i);
    }
    for (std::size_t i = 0; i < v.size(); ++i) {
        std::cout << v[i] << " ";
    }
    std::cout << std::endl;
    std::cout << "size: " << v.size() << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int <code>n</code>, then read <code>n</code> more ints into a vector. Print their sum.',
          starter: `#include <iostream>
#include <vector>

int main() {
    int n;
    std::cin >> n;
    std::vector<int> v;
    // Read n ints into v, then print their sum
    return 0;
}
`,
          tests: [
            { stdin: '5\n1 2 3 4 5\n', expected: '15\n' },
            { stdin: '3\n10 -4 6\n', expected: '12\n' }
          ],
          hint: 'Loop n times: std::cin >> x; v.push_back(x); then add up the elements.',
          solution: `#include <iostream>
#include <vector>

int main() {
    int n;
    std::cin >> n;
    std::vector<int> v;
    for (int i = 0; i < n; ++i) {
        int x;
        std::cin >> x;
        v.push_back(x);
    }
    int sum = 0;
    for (int x : v) sum += x;
    std::cout << sum << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l18',
        title: 'Range-based for',
        body: `
          <p>A range-based <code>for</code> visits every element of a container without an index: <code>for (int x : v)</code>.</p>
          <p>Written that way, <code>x</code> is a copy of each element. Use <code>for (auto&amp; x : v)</code> to work on the elements themselves (for example, to modify them), and <code>const auto&amp;</code> to avoid copying large elements you only read.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {10, 20, 30, 40};

    for (auto& x : v) x += 1;   // modifies the elements

    int total = 0;
    for (int x : v) total += x; // reads copies
    std::cout << total << std::endl;  // 104
    return 0;
}
`,
        exercise: {
          prompt: 'Use a range-based <code>for</code> to count the even numbers in <code>{3, 4, 7, 8, 10, 13}</code> and print the count.',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {3, 4, 7, 8, 10, 13};
    int evens = 0;
    // Count the even numbers with a range-based for
    std::cout << evens << std::endl;
    return 0;
}
`,
          tests: [{ expected: '3\n' }],
          hint: 'for (int x : v) if (x % 2 == 0) evens++;',
          solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {3, 4, 7, 8, 10, 13};
    int evens = 0;
    for (int x : v) {
        if (x % 2 == 0) evens++;
    }
    std::cout << evens << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l19',
        title: 'Grids and nested data',
        body: `
          <p>A vector can hold other vectors, which gives you a grid: <code>std::vector&lt;std::vector&lt;int&gt;&gt; grid</code>. <code>grid[r][c]</code> is the element in row <code>r</code>, column <code>c</code>.</p>
          <p>A built-in 2D array works too when the size is fixed: <code>int g[3][4];</code> is three rows of four columns.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> g = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    for (const auto& row : g) {
        for (int x : row) std::cout << x << " ";
        std::cout << std::endl;
    }
    std::cout << "centre: " << g[1][1] << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Fill a 3x3 grid so that <code>g[i][j] = i * 3 + j + 1</code>, then print it one row per line with values separated by spaces.',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> g(3, std::vector<int>(3));
    // Fill the grid, then print it
    return 0;
}
`,
          tests: [{ expected: '1 2 3\n4 5 6\n7 8 9\n' }],
          hint: 'Use two nested loops to fill the grid, then two more to print it.',
          solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> g(3, std::vector<int>(3));
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 3; ++j) {
            g[i][j] = i * 3 + j + 1;
        }
    }
    for (const auto& row : g) {
        for (int x : row) std::cout << x << " ";
        std::cout << std::endl;
    }
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm5',
    title: 'Pointers and memory',
    sub: 'Addresses, references, the heap, and RAII',
    lessons: [
      {
        id: 'l20',
        title: 'Pointers',
        body: `
          <p>A pointer is a variable that holds a memory address. <code>T* p</code> declares a pointer to a <code>T</code>, <code>&amp;x</code> gives the address of <code>x</code>, and <code>*p</code> gives the value stored at the address in <code>p</code>.</p>
          <pre class="code"><span class="ty">int</span> x = 10;
<span class="ty">int</span>* p = &amp;x;  <span class="cm">// p holds the address of x</span>
*p = 20;      <span class="cm">// x is now 20</span></pre>
          <div class="callout"><code>nullptr</code> is a pointer that points to nothing. Dereferencing it is undefined behavior; in practice the program usually crashes.</div>
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
          prompt: 'Read an int <code>n</code>. Make a pointer <code>p</code> to <code>n</code>, double the value through the pointer with <code>*p = *p * 2;</code>, then print <code>n</code>.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Point p at n and double n through p
    return 0;
}
`,
          tests: [
            { stdin: '10\n', expected: '20\n' },
            { stdin: '-3\n', expected: '-6\n' }
          ],
          hint: 'int* p = &n; *p = *p * 2;',
          solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    int* p = &n;
    *p = *p * 2;
    std::cout << n << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l21',
        title: 'References',
        body: `
          <p>A reference (<code>T&amp;</code>) is another name for an existing variable. It must be initialized when it is declared, and it can't later be changed to refer to something else.</p>
          <p>References are often simpler than pointers: they can't be null, and you use them like the original variable, without <code>*</code>. Use a pointer when "no object" is a valid state or when you need to point at different objects over time.</p>
        `,
        example: `#include <iostream>

int main() {
    int x = 5;
    int& r = x;   // r is another name for x
    r = 99;       // changes x
    std::cout << x << std::endl;  // 99
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>void swapInts(int&amp; a, int&amp; b)</code> that swaps two ints. Read two ints, swap them, and print them as <code>a b</code>.',
          starter: `#include <iostream>

// Define swapInts here

int main() {
    int a, b;
    std::cin >> a >> b;
    // Swap a and b, then print "a b"
    return 0;
}
`,
          tests: [
            { stdin: '3 7\n', expected: '7 3\n' },
            { stdin: '10 -2\n', expected: '-2 10\n' }
          ],
          hint: 'Use a temporary: int t = a; a = b; b = t;',
          solution: `#include <iostream>

void swapInts(int& a, int& b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int a, b;
    std::cin >> a >> b;
    swapInts(a, b);
    std::cout << a << " " << b << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l22',
        title: 'Dynamic memory: new and delete',
        body: `
          <p>Local variables live on the stack and disappear when their scope ends. <code>new T</code> creates a <code>T</code> on the heap instead and returns a pointer to it. The object stays alive until you call <code>delete</code> on that pointer.</p>
          <p>Arrays use a different pair: <code>new T[n]</code> and <code>delete[] p</code>. Mixing them up is a bug.</p>
          <div class="callout">Forgetting <code>delete</code> leaks memory. Deleting the same pointer twice, or using it after <code>delete</code>, is undefined behavior. Containers and smart pointers (covered in the Modern C++ module) do this bookkeeping for you.</div>
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
          prompt: 'Allocate an array of 5 ints with <code>new</code>, fill it with 1 to 5, print the values separated by spaces, then free it with <code>delete[]</code>.',
          starter: `#include <iostream>

int main() {
    int* a = new int[5];
    // Fill with 1..5, print, then delete[]
    return 0;
}
`,
          tests: [{ expected: '1 2 3 4 5\n' }],
          hint: 'a[i] = i + 1; and finish with delete[] a;',
          solution: `#include <iostream>

int main() {
    int* a = new int[5];
    for (int i = 0; i < 5; ++i) a[i] = i + 1;
    for (int i = 0; i < 5; ++i) std::cout << a[i] << " ";
    std::cout << std::endl;
    delete[] a;
    return 0;
}
`
        }
      },
      {
        id: 'l23',
        title: 'RAII',
        body: `
          <p>RAII ("Resource Acquisition Is Initialization") is the central idea of C++ resource management: an object acquires a resource in its constructor and releases it in its destructor. Because destructors run automatically when an object goes out of scope, the resource is always released, even if the function returns early or throws an exception.</p>
          <p>The standard library is built on this. <code>std::vector</code> and <code>std::string</code> free their memory, <code>std::ofstream</code> closes its file, and <code>std::unique_ptr</code> deletes the object it owns.</p>
        `,
        example: `#include <iostream>
#include <vector>

void process() {
    std::vector<int> v(1000);  // memory allocated here
    v[0] = 42;
    std::cout << v[0] << std::endl;
}                              // and freed here, automatically

int main() {
    process();
    std::cout << "no delete needed" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Without using <code>new</code>, put 1, 2, and 3 into a local <code>std::vector&lt;int&gt;</code> and print them separated by spaces.',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    // Add 1, 2, 3 and print them
    return 0;
}
`,
          tests: [{ expected: '1 2 3\n' }],
          hint: 'v.push_back(i) in a loop, then print with a range-based for.',
          solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    for (int i = 1; i <= 3; ++i) v.push_back(i);
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l24',
        title: 'Common pointer mistakes',
        body: `
          <p>Most memory bugs in C++ fall into a few categories:</p>
          <ul>
            <li><b>Dangling pointer:</b> using a pointer to memory that has already been freed or to a local variable that has gone out of scope.</li>
            <li><b>Double free:</b> calling <code>delete</code> twice on the same pointer.</li>
            <li><b>Memory leak:</b> losing the last pointer to heap memory without deleting it.</li>
            <li><b>Buffer overflow:</b> writing past the end of an array.</li>
            <li><b>Null dereference:</b> using <code>*p</code> when <code>p</code> is <code>nullptr</code>.</li>
          </ul>
          <p>The best defense is to avoid raw <code>new</code> and <code>delete</code> where you can: use references, standard containers, and smart pointers. When you do hold a raw pointer that might be null, check it before using it.</p>
        `,
        example: `#include <iostream>

int main() {
    int* p = nullptr;
    if (p == nullptr) {
        std::cout << "p is null, so we don't dereference it" << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'Read an int. If it is 0, print <code>null</code>. Otherwise allocate an int with that value using <code>new</code>, print it through the pointer, and <code>delete</code> it.',
          starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Handle 0 and non-zero
    return 0;
}
`,
          tests: [
            { stdin: '7\n', expected: '7\n' },
            { stdin: '0\n', expected: 'null\n' }
          ],
          hint: 'if (n == 0) print null; else { int* p = new int(n); print *p; delete p; }',
          solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    if (n == 0) {
        std::cout << "null" << std::endl;
        return 0;
    }
    int* p = new int(n);
    std::cout << *p << std::endl;
    delete p;
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm6',
    title: 'Classes',
    sub: 'Structs, classes, constructors, destructors',
    lessons: [
      {
        id: 'l25',
        title: 'Structs',
        body: `
          <p>A <code>struct</code> groups related values into a single type. Access a member with a dot: <code>p.x</code>.</p>
          <p>Members of a struct are public by default. You can give members default values, and you can initialize a whole struct at once with braces.</p>
        `,
        example: `#include <iostream>

struct Point {
    int x = 0;
    int y = 0;
};

int main() {
    Point a;           // x = 0, y = 0
    a.x = 3;
    Point b{5, 12};    // x = 5, y = 12
    std::cout << "(" << a.x << ", " << a.y << ")" << std::endl;
    std::cout << "(" << b.x << ", " << b.y << ")" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Define <code>struct Rect { int w; int h; };</code>. Create one with <code>w = 4</code> and <code>h = 5</code> and print its area.',
          starter: `#include <iostream>

// Define Rect here

int main() {
    // Create a Rect and print w * h
    return 0;
}
`,
          tests: [{ expected: '20\n' }],
          hint: 'Rect r{4, 5}; then print r.w * r.h.',
          solution: `#include <iostream>

struct Rect {
    int w;
    int h;
};

int main() {
    Rect r{4, 5};
    std::cout << r.w * r.h << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l26',
        title: 'Classes and access control',
        body: `
          <p>A <code>class</code> is the same as a <code>struct</code> except that its members are <code>private</code> by default. Private members can only be used by the class's own member functions; <code>public:</code> marks the part other code may use.</p>
          <p>Keeping data private and exposing a small set of member functions is called <b>encapsulation</b>. It lets the class guarantee its data stays valid, because nothing outside can change it directly.</p>
        `,
        example: `#include <iostream>

class Counter {
private:
    int count = 0;
public:
    void increment() { count++; }
    int value() const { return count; }
};

int main() {
    Counter c;
    c.increment();
    c.increment();
    c.increment();
    std::cout << c.value() << std::endl;
    // c.count = 10;  // error: 'count' is private
    return 0;
}
`,
        exercise: {
          prompt: 'Write a class <code>BankAccount</code> with a private <code>balance</code> that starts at 0, a <code>deposit(int)</code> method, and a <code>getBalance()</code> method. Deposit 50, then 25, and print the balance.',
          starter: `#include <iostream>

// Define BankAccount here

int main() {
    // Create an account, deposit 50 and 25, print the balance
    return 0;
}
`,
          tests: [{ expected: '75\n' }],
          hint: 'class BankAccount { int balance = 0; public: void deposit(int amount) { ... } int getBalance() const { ... } };',
          solution: `#include <iostream>

class BankAccount {
    int balance = 0;
public:
    void deposit(int amount) { balance += amount; }
    int getBalance() const { return balance; }
};

int main() {
    BankAccount account;
    account.deposit(50);
    account.deposit(25);
    std::cout << account.getBalance() << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l27',
        title: 'Constructors',
        body: `
          <p>A constructor is a member function with the same name as the class and no return type. It runs when an object is created and sets up its members.</p>
          <p>Initialize members in the <b>member initializer list</b> (<code>: name(n), age(a)</code>) rather than by assigning in the body. Members are constructed directly with the right value instead of being default-constructed and then overwritten, and it is the only way to initialize <code>const</code> and reference members.</p>
          <p>A class can have several constructors with different parameters.</p>
        `,
        example: `#include <iostream>
#include <string>

class Person {
public:
    std::string name;
    int age;

    Person() : name("unknown"), age(0) {}
    Person(const std::string& n, int a) : name(n), age(a) {}

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
          prompt: 'Write a class <code>Box</code> with private int members <code>w</code> and <code>h</code>, a constructor that takes both, and a method <code>area()</code>. Create <code>Box(6, 7)</code> and print its area.',
          starter: `#include <iostream>

// Define Box here

int main() {
    // Create Box(6, 7) and print its area
    return 0;
}
`,
          tests: [{ expected: '42\n' }],
          hint: 'Box(int width, int height) : w(width), h(height) {}',
          solution: `#include <iostream>

class Box {
    int w, h;
public:
    Box(int width, int height) : w(width), h(height) {}
    int area() const { return w * h; }
};

int main() {
    Box b(6, 7);
    std::cout << b.area() << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l28',
        title: 'Destructors',
        body: `
          <p>A destructor, written <code>~ClassName()</code>, runs automatically when an object's lifetime ends: when a local variable goes out of scope, or when a heap object is deleted. It is where a class releases anything it owns.</p>
          <p>Local objects are destroyed in the reverse order they were created. If all of a class's members already clean up after themselves (strings, vectors, smart pointers), you don't need to write a destructor at all.</p>
        `,
        example: `#include <iostream>

class Trace {
public:
    Trace()  { std::cout << "constructed" << std::endl; }
    ~Trace() { std::cout << "destroyed" << std::endl; }
};

int main() {
    std::cout << "start of main" << std::endl;
    {
        Trace t;
        std::cout << "inside the block" << std::endl;
    }   // t is destroyed here
    std::cout << "end of main" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Write a class <code>Loud</code> whose constructor prints <code>start</code> and whose destructor prints <code>end</code>. In <code>main</code>, create one inside a <code>{ }</code> block, then print <code>after</code> once the block has closed.',
          starter: `#include <iostream>

// Define Loud here

int main() {
    {
        // Create a Loud object here
    }
    // Print "after"
    return 0;
}
`,
          tests: [{ expected: 'start\nend\nafter\n' }],
          hint: 'The object is destroyed at the closing brace of the block, before "after" is printed.',
          solution: `#include <iostream>

class Loud {
public:
    Loud()  { std::cout << "start" << std::endl; }
    ~Loud() { std::cout << "end" << std::endl; }
};

int main() {
    {
        Loud l;
    }
    std::cout << "after" << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l29',
        title: 'this and const member functions',
        body: `
          <p>Inside a member function, <code>this</code> is a pointer to the object the function was called on. You rarely need to write <code>this-&gt;side</code>, since <code>side</code> alone means the same thing, but it helps when a parameter has the same name as a member.</p>
          <p>Put <code>const</code> after a member function's parameter list to promise it doesn't modify the object: <code>int area() const</code>. Only <code>const</code> member functions can be called on a <code>const</code> object or through a <code>const</code> reference.</p>
        `,
        example: `#include <iostream>

class Square {
    int side;
public:
    explicit Square(int s) : side(s) {}
    void setSide(int side) { this->side = side; }  // this->side is the member
    int area() const { return side * side; }
};

int main() {
    Square sq(4);
    sq.setSide(5);
    std::cout << sq.area() << std::endl;

    const Square fixed(3);
    std::cout << fixed.area() << std::endl;  // OK: area() is const
    // fixed.setSide(6);  // error: setSide() is not const
    return 0;
}
`,
        exercise: {
          prompt: 'Write a class <code>Vec2</code> with members <code>x</code> and <code>y</code> and a <code>const</code> method <code>lengthSquared()</code> that returns <code>x*x + y*y</code>. Print <code>lengthSquared()</code> for a <code>const Vec2</code> with x = 3, y = 4.',
          starter: `#include <iostream>

// Define Vec2 here

int main() {
    // const Vec2 v(3, 4); then print v.lengthSquared()
    return 0;
}
`,
          tests: [{ expected: '25\n' }],
          hint: 'int lengthSquared() const { return x * x + y * y; }',
          solution: `#include <iostream>

class Vec2 {
public:
    int x, y;
    Vec2(int x, int y) : x(x), y(y) {}
    int lengthSquared() const { return x * x + y * y; }
};

int main() {
    const Vec2 v(3, 4);
    std::cout << v.lengthSquared() << std::endl;
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm7',
    title: 'Inheritance and polymorphism',
    sub: 'Base classes, virtual functions, interfaces',
    lessons: [
      {
        id: 'l30',
        title: 'Inheritance',
        body: `
          <p>A derived class is built on top of a base class and gets all of its members. Write <code>class Dog : public Animal</code> to make <code>Dog</code> derive from <code>Animal</code>.</p>
          <p>The derived class can add its own members. With <code>public</code> inheritance, a <code>Dog</code> can be used anywhere an <code>Animal</code> is expected.</p>
        `,
        example: `#include <iostream>

class Animal {
public:
    void breathe() const { std::cout << "breathe" << std::endl; }
};

class Dog : public Animal {
public:
    void bark() const { std::cout << "woof" << std::endl; }
};

int main() {
    Dog d;
    d.breathe();  // inherited from Animal
    d.bark();
    return 0;
}
`,
        exercise: {
          prompt: 'Derive a class <code>Cat</code> from <code>Animal</code> and give it a method <code>meow()</code> that prints <code>meow</code>. In <code>main</code>, create a <code>Cat</code> and call <code>breathe()</code> and then <code>meow()</code>.',
          starter: `#include <iostream>

class Animal {
public:
    void breathe() const { std::cout << "breathe" << std::endl; }
};

// Define Cat here

int main() {
    // Create a Cat, call breathe() and meow()
    return 0;
}
`,
          tests: [{ expected: 'breathe\nmeow\n' }],
          hint: 'class Cat : public Animal { public: void meow() const { ... } };',
          solution: `#include <iostream>

class Animal {
public:
    void breathe() const { std::cout << "breathe" << std::endl; }
};

class Cat : public Animal {
public:
    void meow() const { std::cout << "meow" << std::endl; }
};

int main() {
    Cat c;
    c.breathe();
    c.meow();
    return 0;
}
`
        }
      },
      {
        id: 'l31',
        title: 'virtual and override',
        body: `
          <p>Declare a member function <code>virtual</code> in the base class to let derived classes replace it. When you call a virtual function through a base-class pointer or reference, the version that runs is chosen by the object's actual type at run time. This is <b>polymorphism</b>.</p>
          <p>Mark the replacement with <code>override</code>. The compiler then reports an error if it doesn't actually match a virtual function in the base, which catches typos and signature mismatches.</p>
          <p>A class meant to be used through base pointers needs a <code>virtual</code> destructor, so that deleting through a base pointer runs the derived destructor too.</p>
        `,
        example: `#include <iostream>

class Shape {
public:
    virtual void draw() const { std::cout << "shape" << std::endl; }
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() const override { std::cout << "circle" << std::endl; }
};

int main() {
    Shape* s = new Circle();
    s->draw();   // prints "circle", not "shape"
    delete s;
    return 0;
}
`,
        exercise: {
          prompt: 'Add a class <code>Square</code> that derives from <code>Shape</code> and overrides <code>draw()</code> to print <code>square</code>. Call it through a <code>Shape*</code>.',
          starter: `#include <iostream>

class Shape {
public:
    virtual void draw() const { std::cout << "shape" << std::endl; }
    virtual ~Shape() = default;
};

// Define Square here

int main() {
    Shape* s = nullptr;  // replace nullptr with new Square()
    if (s) s->draw();
    delete s;
    return 0;
}
`,
          tests: [{ expected: 'square\n' }],
          hint: 'void draw() const override { std::cout << "square" << std::endl; }',
          solution: `#include <iostream>

class Shape {
public:
    virtual void draw() const { std::cout << "shape" << std::endl; }
    virtual ~Shape() = default;
};

class Square : public Shape {
public:
    void draw() const override { std::cout << "square" << std::endl; }
};

int main() {
    Shape* s = new Square();
    if (s) s->draw();
    delete s;
    return 0;
}
`
        }
      },
      {
        id: 'l32',
        title: 'Abstract classes',
        body: `
          <p>A <i>pure virtual</i> function has no body in the base class: <code>virtual void greet() const = 0;</code>. A class with at least one pure virtual function is <b>abstract</b>. You can't create objects of it, only of derived classes that implement every pure virtual function.</p>
          <p>An abstract class with only pure virtual functions is how C++ expresses an interface: it says what operations exist without saying how they work.</p>
        `,
        example: `#include <iostream>

class Greeter {
public:
    virtual void greet() const = 0;
    virtual ~Greeter() = default;
};

class English : public Greeter {
public:
    void greet() const override { std::cout << "hello" << std::endl; }
};

void welcome(const Greeter& g) {  // works with any Greeter
    g.greet();
}

int main() {
    English e;
    welcome(e);
    // Greeter g;  // error: Greeter is abstract
    return 0;
}
`,
        exercise: {
          prompt: 'Add a class <code>Spanish</code> that implements <code>Greeter</code> and prints <code>hola</code>. Call <code>greet()</code> through a <code>Greeter*</code>.',
          starter: `#include <iostream>

class Greeter {
public:
    virtual void greet() const = 0;
    virtual ~Greeter() = default;
};

// Define Spanish here

int main() {
    Greeter* g = nullptr;  // replace nullptr with new Spanish()
    if (g) g->greet();
    delete g;
    return 0;
}
`,
          tests: [{ expected: 'hola\n' }],
          hint: 'class Spanish : public Greeter { public: void greet() const override { ... } };',
          solution: `#include <iostream>

class Greeter {
public:
    virtual void greet() const = 0;
    virtual ~Greeter() = default;
};

class Spanish : public Greeter {
public:
    void greet() const override { std::cout << "hola" << std::endl; }
};

int main() {
    Greeter* g = new Spanish();
    if (g) g->greet();
    delete g;
    return 0;
}
`
        }
      },
      {
        id: 'l33',
        title: 'Polymorphic collections',
        body: `
          <p>A container of base-class pointers can hold objects of different derived types. Calling a virtual function on each element runs the right version for each object.</p>
          <p>The example uses raw pointers so the mechanics are visible, which means it has to delete every object itself. In real code you would store <code>std::unique_ptr&lt;Animal&gt;</code> instead and let the vector clean up.</p>
        `,
        example: `#include <iostream>
#include <vector>

class Animal {
public:
    virtual void speak() const { std::cout << "..." << std::endl; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "woof" << std::endl; }
};

class Cat : public Animal {
public:
    void speak() const override { std::cout << "meow" << std::endl; }
};

int main() {
    std::vector<Animal*> zoo;
    zoo.push_back(new Dog());
    zoo.push_back(new Cat());
    for (const Animal* a : zoo) a->speak();
    for (Animal* a : zoo) delete a;
    return 0;
}
`,
        exercise: {
          prompt: 'Add a class <code>Cow</code> that prints <code>moo</code>. Add a <code>Cow</code> to the zoo after the dog and cat.',
          starter: `#include <iostream>
#include <vector>

class Animal {
public:
    virtual void speak() const { std::cout << "..." << std::endl; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "woof" << std::endl; }
};

class Cat : public Animal {
public:
    void speak() const override { std::cout << "meow" << std::endl; }
};

// Define Cow here

int main() {
    std::vector<Animal*> zoo;
    zoo.push_back(new Dog());
    zoo.push_back(new Cat());
    // Add a Cow
    for (const Animal* a : zoo) a->speak();
    for (Animal* a : zoo) delete a;
    return 0;
}
`,
          tests: [{ expected: 'woof\nmeow\nmoo\n' }],
          hint: 'class Cow : public Animal { ... }; then zoo.push_back(new Cow());',
          solution: `#include <iostream>
#include <vector>

class Animal {
public:
    virtual void speak() const { std::cout << "..." << std::endl; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "woof" << std::endl; }
};

class Cat : public Animal {
public:
    void speak() const override { std::cout << "meow" << std::endl; }
};

class Cow : public Animal {
public:
    void speak() const override { std::cout << "moo" << std::endl; }
};

int main() {
    std::vector<Animal*> zoo;
    zoo.push_back(new Dog());
    zoo.push_back(new Cat());
    zoo.push_back(new Cow());
    for (const Animal* a : zoo) a->speak();
    for (Animal* a : zoo) delete a;
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm8',
    title: 'Templates',
    sub: 'Generic functions and classes, and the standard library',
    lessons: [
      {
        id: 'l34',
        title: 'Function templates',
        body: `
          <p>A function template is a pattern for a family of functions. You write it once with a placeholder type, and the compiler generates a real function for each type you call it with.</p>
          <pre class="code"><span class="kw">template</span> &lt;<span class="kw">typename</span> T&gt;
T add(T a, T b) { <span class="kw">return</span> a + b; }</pre>
          <p>Usually the compiler works out <code>T</code> from the arguments. Both arguments here must have the same type, so <code>add(1, 2.5)</code> won't compile unless you say which type you mean: <code>add&lt;double&gt;(1, 2.5)</code>.</p>
        `,
        example: `#include <iostream>
#include <string>

template <typename T>
T biggest(T a, T b) {
    return a > b ? a : b;
}

int main() {
    std::cout << biggest(3, 9) << std::endl;                // T = int
    std::cout << biggest(2.5, 1.25) << std::endl;           // T = double
    std::cout << biggest<double>(1, 2.5) << std::endl;      // T given explicitly
    std::cout << biggest(std::string("pear"), std::string("apple")) << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Write a function template <code>T smallest(T a, T b)</code>. Print <code>smallest(5, 2)</code> and then <code>smallest(1.5, 4.0)</code>, each on its own line.',
          starter: `#include <iostream>

// Define the smallest template here

int main() {
    // Print smallest(5, 2) and smallest(1.5, 4.0)
    return 0;
}
`,
          tests: [{ expected: '2\n1.5\n' }],
          hint: 'template <typename T> T smallest(T a, T b) { return a < b ? a : b; }',
          solution: `#include <iostream>

template <typename T>
T smallest(T a, T b) {
    return a < b ? a : b;
}

int main() {
    std::cout << smallest(5, 2) << std::endl;
    std::cout << smallest(1.5, 4.0) << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l35',
        title: 'Class templates',
        body: `
          <p>Classes can be templates too. You give the type in angle brackets when you use the class: <code>Box&lt;int&gt;</code>. The standard containers are class templates, which is why you write <code>std::vector&lt;int&gt;</code>.</p>
        `,
        example: `#include <iostream>
#include <string>

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
    Box<std::string> c("text");
    std::cout << a.get() << " " << b.get() << " " << c.get() << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Write a class template <code>Pair&lt;T&gt;</code> that stores two values of type <code>T</code> and has a method <code>sum()</code>. Print <code>Pair&lt;int&gt;(4, 6).sum()</code>.',
          starter: `#include <iostream>

// Define the Pair template here

int main() {
    // Print Pair<int>(4, 6).sum()
    return 0;
}
`,
          tests: [{ expected: '10\n' }],
          hint: 'template <typename T> class Pair { T a, b; public: Pair(T x, T y) : a(x), b(y) {} T sum() const { ... } };',
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
}
`
        }
      },
      {
        id: 'l36',
        title: 'Standard library algorithms',
        body: `
          <p>The standard library's containers (<code>vector</code>, <code>map</code>, <code>set</code>, and others) come with a large set of ready-made algorithms in <code>&lt;algorithm&gt;</code>, such as <code>std::sort</code>, <code>std::find</code>, <code>std::count</code>, and <code>std::max_element</code>.</p>
          <p>Algorithms work on a range given by two <b>iterators</b>. <code>v.begin()</code> refers to the first element and <code>v.end()</code> to the position just past the last one. Algorithms that search, like <code>std::max_element</code>, return an iterator; use <code>*</code> to get the value it refers to.</p>
          <p>Before writing a loop, it is worth checking whether an algorithm already does the job. It is less code to get wrong, and the name says what the code does.</p>
        `,
        example: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};

    auto biggest = std::max_element(v.begin(), v.end());
    std::cout << "max: " << *biggest << std::endl;
    std::cout << "ones: " << std::count(v.begin(), v.end(), 1) << std::endl;

    std::sort(v.begin(), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Use <code>std::min_element</code> to print the smallest value in <code>{5, 2, 9, 1, 7}</code>.',
          starter: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 9, 1, 7};
    // Print the smallest value using std::min_element
    return 0;
}
`,
          tests: [{ expected: '1\n' }],
          hint: 'std::min_element(v.begin(), v.end()) returns an iterator; print *it.',
          solution: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 9, 1, 7};
    auto it = std::min_element(v.begin(), v.end());
    std::cout << *it << std::endl;
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm9',
    title: 'Modern C++',
    sub: 'auto, lambdas, smart pointers, move semantics',
    lessons: [
      {
        id: 'l37',
        title: 'auto',
        body: `
          <p><code>auto</code> tells the compiler to deduce a variable's type from its initializer. It is most useful when the type is long or obvious from context, such as an iterator: <code>auto it = v.begin();</code> instead of <code>std::vector&lt;int&gt;::iterator it = v.begin();</code>.</p>
          <p>The type is still fixed at compile time; <code>auto</code> just saves typing. Note that plain <code>auto</code> makes a copy, so use <code>auto&amp;</code> or <code>const auto&amp;</code> when you want a reference.</p>
        `,
        example: `#include <iostream>
#include <vector>

int main() {
    auto x = 42;      // int
    auto pi = 3.14;   // double
    std::vector<int> v = {10, 20, 30};

    auto it = v.begin();  // std::vector<int>::iterator
    std::cout << *it << std::endl;

    for (const auto& y : v) std::cout << y << " ";
    std::cout << std::endl;
    std::cout << x << " " << pi << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Use <code>auto</code> in a range-based <code>for</code> loop to add up <code>{2, 4, 8, 16, 32}</code>, and print the sum.',
          starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {2, 4, 8, 16, 32};
    int sum = 0;
    // Add up the elements using auto
    std::cout << sum << std::endl;
    return 0;
}
`,
          tests: [{ expected: '62\n' }],
          hint: 'for (auto x : v) sum += x;',
          solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {2, 4, 8, 16, 32};
    int sum = 0;
    for (auto x : v) sum += x;
    std::cout << sum << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l38',
        title: 'Lambdas',
        body: `
          <p>A lambda is a function written inline, right where it is needed: <code>[](int x) { return x * x; }</code>. They are often passed to standard algorithms.</p>
          <p>The square brackets are the <b>capture list</b>. They say which variables from the surrounding scope the lambda can use:</p>
          <ul>
            <li><code>[]</code> captures nothing</li>
            <li><code>[x]</code> captures <code>x</code> by value (a copy)</li>
            <li><code>[&amp;x]</code> captures <code>x</code> by reference</li>
            <li><code>[=]</code> or <code>[&amp;]</code> capture everything used, by value or by reference</li>
          </ul>
        `,
        example: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    int factor = 3;
    auto times = [factor](int x) { return x * factor; };
    std::cout << times(5) << std::endl;  // 15

    std::vector<int> v = {4, 7, 1, 8, 3};
    auto bigOnes = std::count_if(v.begin(), v.end(), [](int x) { return x > 3; });
    std::cout << bigOnes << " values are greater than 3" << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Define a lambda <code>plusOne</code> with no captures that returns <code>x + 1</code>. Print <code>plusOne(41)</code>.',
          starter: `#include <iostream>

int main() {
    // auto plusOne = ...
    // Print plusOne(41)
    return 0;
}
`,
          tests: [{ expected: '42\n' }],
          hint: 'auto plusOne = [](int x) { return x + 1; };',
          solution: `#include <iostream>

int main() {
    auto plusOne = [](int x) { return x + 1; };
    std::cout << plusOne(41) << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l39',
        title: 'Smart pointers',
        body: `
          <p>Smart pointers own heap objects and delete them automatically. They are RAII applied to <code>new</code> and <code>delete</code>. All three live in <code>&lt;memory&gt;</code>:</p>
          <ul>
            <li><code>std::unique_ptr&lt;T&gt;</code> is the only owner of its object. It can be moved but not copied. Use it by default.</li>
            <li><code>std::shared_ptr&lt;T&gt;</code> allows several owners. It counts them and deletes the object when the last one goes away.</li>
            <li><code>std::weak_ptr&lt;T&gt;</code> observes an object owned by <code>shared_ptr</code> without keeping it alive.</li>
          </ul>
          <p>Create them with <code>std::make_unique&lt;T&gt;(args)</code> and <code>std::make_shared&lt;T&gt;(args)</code> rather than calling <code>new</code> yourself.</p>
        `,
        example: `#include <iostream>
#include <memory>
#include <string>

struct Song {
    std::string title;
    Song(const std::string& t) : title(t) { std::cout << "load " << title << std::endl; }
    ~Song() { std::cout << "free " << title << std::endl; }
};

int main() {
    auto a = std::make_unique<Song>("Intro");
    std::cout << "playing " << a->title << std::endl;

    auto b = std::make_shared<Song>("Outro");
    auto c = b;  // two owners of the same Song
    std::cout << "owners: " << b.use_count() << std::endl;
    return 0;
}   // c, b, and a are destroyed here; each Song is freed exactly once
`,
        exercise: {
          prompt: 'Use <code>std::make_unique</code> to create a <code>std::unique_ptr&lt;int&gt;</code> holding 100, then print the value it points to.',
          starter: `#include <iostream>
#include <memory>

int main() {
    // Create a unique_ptr<int> holding 100 and print *p
    return 0;
}
`,
          tests: [{ expected: '100\n' }],
          hint: 'auto p = std::make_unique<int>(100);',
          solution: `#include <iostream>
#include <memory>

int main() {
    auto p = std::make_unique<int>(100);
    std::cout << *p << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l40',
        title: 'Move semantics',
        body: `
          <p>Copying a large object such as a long string or a big vector means copying all of its contents. Often the original is about to be thrown away, so the copy is wasted work. <b>Moving</b> instead transfers the contents: the new object takes over the old one's memory, and nothing is copied.</p>
          <p><code>std::move(x)</code> (from <code>&lt;utility&gt;</code>) doesn't move anything by itself. It marks <code>x</code> as something that may be moved from, so that a move constructor or move assignment gets chosen instead of a copy. Those functions take an <i>rvalue reference</i>, written <code>T&amp;&amp;</code>.</p>
          <p>After a move, the source is still a valid object but its value is unspecified. You can assign it a new value or let it be destroyed, but don't rely on what it contains.</p>
        `,
        example: `#include <iostream>
#include <string>
#include <utility>
#include <vector>

int main() {
    std::string a = "a fairly long string that lives on the heap";
    std::string b = std::move(a);  // b takes over a's buffer
    std::cout << "b = " << b << std::endl;
    a = "reused";                  // fine: give a a new value
    std::cout << "a = " << a << std::endl;

    std::vector<std::string> names;
    std::string name = "Ada";
    names.push_back(std::move(name));  // moved into the vector, not copied
    std::cout << names[0] << std::endl;
    return 0;
}
`,
        exercise: {
          prompt: 'Create <code>std::string s = "C++";</code>, move it into a new string <code>t</code>, and print <code>t</code>.',
          starter: `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string s = "C++";
    // Move s into t, then print t
    return 0;
}
`,
          tests: [{ expected: 'C++\n' }],
          hint: 'std::string t = std::move(s);',
          solution: `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string s = "C++";
    std::string t = std::move(s);
    std::cout << t << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l41',
        title: 'Writing idiomatic C++',
        body: `
          <p>A few habits cover most of what makes C++ code look modern and stay safe:</p>
          <ul>
            <li>Use <code>std::vector</code>, <code>std::string</code>, and smart pointers. Raw <code>new</code> and <code>delete</code> should be rare.</li>
            <li>Pass large inputs by <code>const T&amp;</code> and small ones (<code>int</code>, <code>double</code>) by value.</li>
            <li>Mark variables and member functions <code>const</code> when they don't change anything.</li>
            <li>Use range-based <code>for</code> and standard algorithms instead of index loops where they fit.</li>
            <li>Let objects own their resources (RAII) so cleanup happens automatically.</li>
            <li>Compile with warnings on (<code>-Wall -Wextra</code>) and fix them.</li>
          </ul>
        `,
        example: `#include <iostream>
#include <string>
#include <vector>

void printAll(const std::vector<std::string>& names) {
    for (const auto& n : names) std::cout << n << std::endl;
}

int main() {
    const std::vector<std::string> names = {"Sam", "Ada", "Bjarne"};
    printAll(names);
    return 0;
}
`,
        exercise: {
          prompt: 'Write <code>void printDoubled(const std::vector&lt;int&gt;&amp; v)</code> that prints each element times 2, separated by spaces, then a newline. Call it with <code>{1, 2, 3}</code>.',
          starter: `#include <iostream>
#include <vector>

// Define printDoubled here

int main() {
    std::vector<int> v = {1, 2, 3};
    // Call printDoubled(v)
    return 0;
}
`,
          tests: [{ expected: '2 4 6\n' }],
          hint: 'for (int x : v) std::cout << x * 2 << " ";',
          solution: `#include <iostream>
#include <vector>

void printDoubled(const std::vector<int>& v) {
    for (int x : v) std::cout << x * 2 << " ";
    std::cout << std::endl;
}

int main() {
    std::vector<int> v = {1, 2, 3};
    printDoubled(v);
    return 0;
}
`
        }
      }
    ]
  },
  {
    id: 'm10',
    title: 'Projects',
    sub: 'Small programs that combine what you have learned',
    lessons: [
      {
        id: 'l42',
        title: 'Number guessing game',
        body: `
          <p>A guessing game: the program has a secret number between 1 and 100, reads guesses, and answers <code>higher</code>, <code>lower</code>, or <code>got it!</code>.</p>
          <p>Note the loop condition <code>while (std::cin &gt;&gt; guess)</code>. Reading from <code>std::cin</code> evaluates to false when there is no more input, so the loop ends cleanly instead of running forever on an empty input box.</p>
          <p>Skills used: variables, loops, conditionals, input.</p>
        `,
        example: `#include <iostream>

int main() {
    const int secret = 42;
    int guess;
    while (std::cin >> guess) {
        std::cout << guess << ": ";
        if (guess < secret) {
            std::cout << "higher" << std::endl;
        } else if (guess > secret) {
            std::cout << "lower" << std::endl;
        } else {
            std::cout << "got it!" << std::endl;
            break;
        }
    }
    return 0;
}
`,
        exampleStdin: '50\n25\n42\n',
        exercise: {
          prompt: 'The secret is 50. Read up to 3 guesses. For each one print <code>higher</code>, <code>lower</code>, or <code>got it!</code>, and stop reading as soon as a guess is right.',
          starter: `#include <iostream>

int main() {
    const int secret = 50;
    int guess;
    for (int i = 0; i < 3; ++i) {
        std::cin >> guess;
        // Print the response; stop if the guess is right
    }
    return 0;
}
`,
          tests: [
            { stdin: '70\n30\n50\n', expected: 'lower\nhigher\ngot it!\n' },
            { stdin: '60\n50\n10\n', expected: 'lower\ngot it!\n' },
            { stdin: '1\n2\n3\n', expected: 'higher\nhigher\nhigher\n' }
          ],
          hint: 'Use if / else if / else inside the loop, and break after printing "got it!".',
          solution: `#include <iostream>

int main() {
    const int secret = 50;
    int guess;
    for (int i = 0; i < 3; ++i) {
        std::cin >> guess;
        if (guess < secret) {
            std::cout << "higher" << std::endl;
        } else if (guess > secret) {
            std::cout << "lower" << std::endl;
        } else {
            std::cout << "got it!" << std::endl;
            break;
        }
    }
    return 0;
}
`
        }
      },
      {
        id: 'l43',
        title: 'A calculator class',
        body: `
          <p>A class that keeps a running total, with member functions to add, subtract, multiply, and read the result. The total is private, so the only way to change it is through those functions.</p>
          <p>Skills used: classes, member functions, default member initializers, <code>const</code>.</p>
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
    c.add(10);
    c.mul(3);
    c.sub(5);
    std::cout << c.get() << std::endl;  // 25
    return 0;
}
`,
        exercise: {
          prompt: 'Add a <code>div(double x)</code> member function to <code>Calc</code>. Then do <code>add(7)</code>, <code>mul(4)</code>, <code>div(2)</code>, <code>add(1)</code> and print the total.',
          starter: `#include <iostream>

class Calc {
    double total = 0;
public:
    void add(double x) { total += x; }
    void sub(double x) { total -= x; }
    void mul(double x) { total *= x; }
    // Add div here
    double get() const { return total; }
};

int main() {
    Calc c;
    // add(7), mul(4), div(2), add(1), then print get()
    return 0;
}
`,
          tests: [{ expected: '15\n' }],
          hint: 'void div(double x) { total /= x; }',
          solution: `#include <iostream>

class Calc {
    double total = 0;
public:
    void add(double x) { total += x; }
    void sub(double x) { total -= x; }
    void mul(double x) { total *= x; }
    void div(double x) { total /= x; }
    double get() const { return total; }
};

int main() {
    Calc c;
    c.add(7);
    c.mul(4);
    c.div(2);
    c.add(1);
    std::cout << c.get() << std::endl;
    return 0;
}
`
        }
      },
      {
        id: 'l44',
        title: 'Where to go next',
        body: `
          <p>You have now seen the core of the language: types, control flow, functions, references and pointers, classes, inheritance, templates, and the main modern features. The next step is to write larger programs of your own.</p>
          <h3>Project ideas</h3>
          <ul>
            <li><b>Systems:</b> a command-line to-do list that saves to a file, a hash table, a tiny shell.</li>
            <li><b>Games:</b> a small 2D game with SFML (a C++ library) or raylib (a C library that works well from C++).</li>
            <li><b>Performance:</b> time two approaches with <code>std::chrono</code> and find out why one is faster.</li>
            <li><b>Practice problems:</b> sites such as Codeforces and LeetCode accept C++ solutions.</li>
          </ul>
          <h3>Tools worth learning</h3>
          <ul>
            <li>A local compiler: <code>g++</code> or <code>clang++</code> on Linux and macOS, Visual Studio or MinGW on Windows.</li>
            <li>CMake, the most widely used build system for C++ projects.</li>
            <li>A debugger (gdb, lldb, or the one in your IDE). Stepping through code line by line is the fastest way to understand a bug.</li>
          </ul>
          <p>For reading, <i>A Tour of C++</i> by Bjarne Stroustrup is a short overview of the whole language by its creator.</p>
        `,
        example: `#include <iostream>
#include <string>
#include <vector>

int main() {
    const std::vector<std::string> next = {"build something", "read code", "use a debugger"};
    for (std::size_t i = 0; i < next.size(); ++i) {
        std::cout << i + 1 << ". " << next[i] << std::endl;
    }
    return 0;
}
`,
        exercise: {
          prompt: 'One last exercise that uses several ideas at once. Write <code>double average(const std::vector&lt;int&gt;&amp; v)</code> and print the average of <code>{4, 8, 15, 16, 23, 42}</code>.',
          starter: `#include <iostream>
#include <vector>

// Define average here

int main() {
    const std::vector<int> v = {4, 8, 15, 16, 23, 42};
    // Print average(v)
    return 0;
}
`,
          tests: [{ expected: '18\n' }],
          hint: 'Add up the elements as an int, then return static_cast<double>(sum) / v.size().',
          solution: `#include <iostream>
#include <vector>

double average(const std::vector<int>& v) {
    int sum = 0;
    for (int x : v) sum += x;
    return static_cast<double>(sum) / v.size();
}

int main() {
    const std::vector<int> v = {4, 8, 15, 16, 23, 42};
    std::cout << average(v) << std::endl;
    return 0;
}
`
        }
      }
    ]
  }
];

const PRACTICE = [
  {
    id: 'p1',
    title: 'Sum of two',
    level: 'Easy',
    prompt: 'Read two ints and print their sum.',
    starter: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    // Print a + b
    return 0;
}
`,
    tests: [
      { stdin: '4 7\n', expected: '11\n' },
      { stdin: '-10 3\n', expected: '-7\n' }
    ],
    solution: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    std::cout << a + b << std::endl;
    return 0;
}
`
  },
  {
    id: 'p2',
    title: 'FizzBuzz',
    level: 'Easy',
    prompt: 'Print the numbers 1 to 15, one per line, but print <code>Fizz</code> for multiples of 3, <code>Buzz</code> for multiples of 5, and <code>FizzBuzz</code> for multiples of both.',
    starter: `#include <iostream>

int main() {
    for (int i = 1; i <= 15; ++i) {
        // Print i, Fizz, Buzz, or FizzBuzz
    }
    return 0;
}
`,
    tests: [{ expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n' }],
    solution: `#include <iostream>

int main() {
    for (int i = 1; i <= 15; ++i) {
        if (i % 15 == 0) std::cout << "FizzBuzz" << std::endl;
        else if (i % 3 == 0) std::cout << "Fizz" << std::endl;
        else if (i % 5 == 0) std::cout << "Buzz" << std::endl;
        else std::cout << i << std::endl;
    }
    return 0;
}
`
  },
  {
    id: 'p3',
    title: 'Reverse the digits',
    level: 'Easy',
    prompt: 'Read a positive int and print its digits in reverse order as a number. For example, 1234 becomes 4321.',
    starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Print the digits of n reversed
    return 0;
}
`,
    tests: [
      { stdin: '1234\n', expected: '4321\n' },
      { stdin: '907\n', expected: '709\n' }
    ],
    solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    int reversed = 0;
    while (n > 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    std::cout << reversed << std::endl;
    return 0;
}
`
  },
  {
    id: 'p4',
    title: 'Count vowels',
    level: 'Easy',
    prompt: 'Read a lowercase word and print how many vowels (a, e, i, o, u) it contains.',
    starter: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    // Count the vowels
    return 0;
}
`,
    tests: [
      { stdin: 'developer\n', expected: '4\n' },
      { stdin: 'rhythm\n', expected: '0\n' }
    ],
    solution: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    int count = 0;
    for (char ch : s) {
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') count++;
    }
    std::cout << count << std::endl;
    return 0;
}
`
  },
  {
    id: 'p5',
    title: 'Largest of n',
    level: 'Medium',
    prompt: 'Read an int <code>n</code> (at least 1), then <code>n</code> ints. Print the largest.',
    starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Read n ints and print the largest
    return 0;
}
`,
    tests: [
      { stdin: '5\n3 99 12 4 7\n', expected: '99\n' },
      { stdin: '3\n-5 -2 -9\n', expected: '-2\n' }
    ],
    solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    int best;
    std::cin >> best;
    for (int i = 1; i < n; ++i) {
        int x;
        std::cin >> x;
        if (x > best) best = x;
    }
    std::cout << best << std::endl;
    return 0;
}
`
  },
  {
    id: 'p6',
    title: 'Prime check',
    level: 'Medium',
    prompt: 'Read an int <code>n</code> (at least 2). Print <code>prime</code> or <code>not prime</code>.',
    starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Print "prime" or "not prime"
    return 0;
}
`,
    tests: [
      { stdin: '17\n', expected: 'prime\n' },
      { stdin: '21\n', expected: 'not prime\n' },
      { stdin: '2\n', expected: 'prime\n' }
    ],
    solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    bool prime = n >= 2;
    for (int i = 2; i <= n / i; ++i) {
        if (n % i == 0) {
            prime = false;
            break;
        }
    }
    std::cout << (prime ? "prime" : "not prime") << std::endl;
    return 0;
}
`
  },
  {
    id: 'p7',
    title: 'Fibonacci',
    level: 'Medium',
    prompt: 'Read an int <code>n</code> between 0 and 50. Print the nth Fibonacci number, where fib(0) = 0 and fib(1) = 1.',
    starter: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    // Print fib(n)
    return 0;
}
`,
    tests: [
      { stdin: '10\n', expected: '55\n' },
      { stdin: '0\n', expected: '0\n' },
      { stdin: '50\n', expected: '12586269025\n' }
    ],
    solution: `#include <iostream>

int main() {
    int n;
    std::cin >> n;
    long long a = 0, b = 1;  // fib(50) doesn't fit in a 32-bit int
    for (int i = 0; i < n; ++i) {
        long long next = a + b;
        a = b;
        b = next;
    }
    std::cout << a << std::endl;
    return 0;
}
`
  },
  {
    id: 'p8',
    title: 'Palindrome',
    level: 'Medium',
    prompt: 'Read a word. Print <code>yes</code> if it reads the same backwards, otherwise <code>no</code>. Upper and lower case count as different letters.',
    starter: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    // Print "yes" or "no"
    return 0;
}
`,
    tests: [
      { stdin: 'racecar\n', expected: 'yes\n' },
      { stdin: 'rocket\n', expected: 'no\n' },
      { stdin: 'Abba\n', expected: 'no\n' }
    ],
    solution: `#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    bool palindrome = true;
    for (std::size_t i = 0, j = s.size() - 1; i < j; ++i, --j) {
        if (s[i] != s[j]) {
            palindrome = false;
            break;
        }
    }
    std::cout << (palindrome ? "yes" : "no") << std::endl;
    return 0;
}
`
  },
  {
    id: 'p9',
    title: 'Greatest common divisor',
    level: 'Hard',
    prompt: 'Read two positive ints and print their greatest common divisor. Euclid\'s algorithm: replace (a, b) with (b, a % b) until b is 0; then a is the answer.',
    starter: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    // Print gcd(a, b)
    return 0;
}
`,
    tests: [
      { stdin: '24 18\n', expected: '6\n' },
      { stdin: '7 13\n', expected: '1\n' }
    ],
    solution: `#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    std::cout << a << std::endl;
    return 0;
}
`
  },
  {
    id: 'p10',
    title: 'Sort five numbers',
    level: 'Hard',
    prompt: 'Read 5 ints and print them in ascending order, separated by spaces. Write the sort yourself (for example, a bubble sort) rather than using <code>std::sort</code>.',
    starter: `#include <iostream>

int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    // Sort a, then print it
    return 0;
}
`,
    tests: [
      { stdin: '4 2 5 1 3\n', expected: '1 2 3 4 5\n' },
      { stdin: '9 -1 9 0 3\n', expected: '-1 0 3 9 9\n' }
    ],
    solution: `#include <iostream>

int main() {
    int a[5];
    for (int i = 0; i < 5; ++i) std::cin >> a[i];
    for (int pass = 0; pass < 4; ++pass) {
        for (int i = 0; i < 4 - pass; ++i) {
            if (a[i] > a[i + 1]) {
                int t = a[i];
                a[i] = a[i + 1];
                a[i + 1] = t;
            }
        }
    }
    for (int i = 0; i < 5; ++i) std::cout << a[i] << " ";
    std::cout << std::endl;
    return 0;
}
`
  }
];

const REFERENCE = [
  {
    title: 'Input and output',
    items: [
      { code: '#include <iostream>', desc: 'std::cin, std::cout, std::cerr' },
      { code: "std::cout << x << '\\n';", desc: 'Print x and a newline' },
      { code: 'std::cout << x << std::endl;', desc: 'Print x, a newline, and flush' },
      { code: 'std::cin >> x;', desc: 'Read one whitespace-separated value' },
      { code: 'std::getline(std::cin, line);', desc: 'Read a whole line into a std::string' }
    ]
  },
  {
    title: 'Types',
    items: [
      { code: 'int  long long', desc: 'Whole numbers; int is usually 32 bits, long long at least 64' },
      { code: 'double', desc: 'Floating point; the usual choice for decimals' },
      { code: 'char  bool', desc: "A single character ('a'), true or false" },
      { code: 'std::string', desc: 'Text (#include <string>)' },
      { code: 'auto x = expr;', desc: 'Type deduced from the initializer' },
      { code: 'static_cast<double>(n)', desc: 'Explicit conversion' }
    ]
  },
  {
    title: 'Control flow',
    items: [
      { code: 'if (c) { } else if (d) { } else { }', desc: 'Branch on a condition' },
      { code: 'switch (v) { case 1: ... break; default: ... }', desc: 'Branch on an integer, char, or enum value' },
      { code: 'for (int i = 0; i < n; ++i) { }', desc: 'Counting loop' },
      { code: 'while (c) { }  do { } while (c);', desc: 'Loop while a condition holds' },
      { code: 'for (const auto& x : v) { }', desc: 'Visit every element of a container' }
    ]
  },
  {
    title: 'Functions',
    items: [
      { code: 'int f(int a, int b) { return a + b; }', desc: 'Definition' },
      { code: 'void f(int& x);', desc: 'Pass by reference; can modify the caller\'s variable' },
      { code: 'void f(const std::string& s);', desc: 'Read-only reference; avoids a copy' },
      { code: 'void f(int x = 0);', desc: 'Default argument' },
      { code: 'template <typename T> T f(T a);', desc: 'Function template' },
      { code: '[&](int x) { return x + total; }', desc: 'Lambda capturing by reference' }
    ]
  },
  {
    title: 'Pointers and memory',
    items: [
      { code: 'int* p = &x;  *p = 42;', desc: 'Take an address, dereference it' },
      { code: 'nullptr', desc: 'A pointer to nothing' },
      { code: 'int& r = x;', desc: 'Reference: another name for x' },
      { code: 'auto p = std::make_unique<T>(args);', desc: 'Single owner, deleted automatically (#include <memory>)' },
      { code: 'auto p = std::make_shared<T>(args);', desc: 'Shared, reference-counted ownership' },
      { code: 'std::move(x)', desc: 'Allow x to be moved from (#include <utility>)' }
    ]
  },
  {
    title: 'Containers and algorithms',
    items: [
      { code: 'std::vector<int> v = {1, 2, 3};', desc: 'Resizable array (#include <vector>)' },
      { code: 'v.push_back(x);  v.size();  v[i];', desc: 'Append, count, index' },
      { code: 'std::map<std::string, int> m;', desc: 'Sorted key/value pairs (#include <map>)' },
      { code: 'std::set<int> s;', desc: 'Sorted unique values (#include <set>)' },
      { code: 'std::sort(v.begin(), v.end());', desc: 'Sort a range (#include <algorithm>)' },
      { code: 'std::find(v.begin(), v.end(), x)', desc: 'Iterator to the first x, or v.end()' }
    ]
  },
  {
    title: 'Classes',
    items: [
      { code: 'class C { public: ... private: ... };', desc: 'Members are private by default' },
      { code: 'C(int v) : member(v) { }', desc: 'Constructor with member initializer list' },
      { code: '~C() { }', desc: 'Destructor; runs when the object is destroyed' },
      { code: 'int get() const;', desc: 'Member function that doesn\'t modify the object' },
      { code: 'class D : public B { };', desc: 'Public inheritance' },
      { code: 'virtual void f() = 0;', desc: 'Pure virtual; makes the class abstract' },
      { code: 'void f() override;', desc: 'Overrides a virtual function in the base' }
    ]
  }
];

const TEMPLATES = [
  {
    id: 'hello',
    label: 'Hello, World!',
    code: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`
  },
  {
    id: 'input',
    label: 'Reading input',
    stdin: 'Sam 21\n',
    code: `#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;
    std::cin >> name >> age;
    std::cout << name << " will be " << age + 1 << " next year." << std::endl;
    return 0;
}
`
  },
  {
    id: 'loop',
    label: 'Sum with a for loop',
    code: `#include <iostream>

int main() {
    int n = 10, sum = 0;
    for (int i = 1; i <= n; ++i) sum += i;
    std::cout << "Sum of 1.." << n << " = " << sum << std::endl;
    return 0;
}
`
  },
  {
    id: 'vector',
    label: 'std::vector',
    code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    for (int i = 1; i <= 5; ++i) v.push_back(i * i);
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`
  },
  {
    id: 'class',
    label: 'A small class',
    code: `#include <iostream>
#include <string>

class Greeter {
    std::string who;
public:
    explicit Greeter(const std::string& name) : who(name) {}
    void greet() const {
        std::cout << "Hello, " << who << "!" << std::endl;
    }
};

int main() {
    Greeter g("world");
    g.greet();
    return 0;
}
`
  },
  {
    id: 'map',
    label: 'Word count with std::map',
    code: `#include <iostream>
#include <map>
#include <sstream>
#include <string>

int main() {
    std::istringstream text("the cat and the dog and the bird");
    std::map<std::string, int> counts;
    std::string word;
    while (text >> word) counts[word]++;
    for (const auto& [w, n] : counts) {
        std::cout << w << ": " << n << std::endl;
    }
    return 0;
}
`
  },
  {
    id: 'sort',
    label: 'Sorting with std::sort',
    code: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 9, 1, 7, 3};
    std::sort(v.begin(), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;

    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}
`
  },
  {
    id: 'smart',
    label: 'Shapes with unique_ptr',
    code: `#include <iostream>
#include <memory>
#include <vector>

struct Shape {
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

struct Rect : Shape {
    double w, h;
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};

struct Circle : Shape {
    double r;
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Rect>(3, 4));
    shapes.push_back(std::make_unique<Circle>(1));
    for (const auto& s : shapes) std::cout << s->area() << std::endl;
    return 0;
}   // the vector deletes every shape
`
  }
];
