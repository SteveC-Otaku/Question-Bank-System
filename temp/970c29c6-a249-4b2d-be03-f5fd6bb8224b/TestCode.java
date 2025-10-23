import java.util.Scanner;

public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Calculator calculator = new Calculator();

        // 提示用户输入两个整数
        System.out.print("请输入第一个整数 (a): ");
        int a = scanner.nextInt();

        System.out.print("请输入第二个整数 (b): ");
        int b = scanner.nextInt();

        // 调用加法方法并输出结果
        int result = calculator.add(a, b);
        System.out.println("计算结果: " + a + " + " + b + " = " + result);

        scanner.close();
    }
}