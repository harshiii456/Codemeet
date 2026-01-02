const codeSnippets = {
    javascript: `function greet() {
      console.log("Hello, world!");
    }
  
    greet();`,
    
    python: `def greet():
      print("Hello, world!")
  
  greet()`,
    
    java: `public class Main {
      public static void main(String[] args) {
        System.out.println("Hello, world!");
      }
    }`,
    
    c: `#include <stdio.h>
  
  int main() {
      printf("Hello, world!\\n");
      return 0;
  }`,
    
    cpp: `#include <iostream>
  
  int main() {
      std::cout << "Hello, world!" << std::endl;
      return 0;
  }`
  };
  
  export default codeSnippets;
  