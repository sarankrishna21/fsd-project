package com.library.store.config;

import com.library.store.entity.*;
import com.library.store.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        log.info("Seeding database with initial data...");
        seedUsers();
        List<Category> categories = seedCategories();
        seedBooks(categories);
        log.info("Database seeding complete!");
    }

    private void seedUsers() {
        // Admin user
        userRepository.save(User.builder()
            .name("Admin User")
            .email("admin@library.com")
            .password(passwordEncoder.encode("admin123"))
            .role(User.Role.ROLE_ADMIN)
            .status(User.UserStatus.ACTIVE)
            .build());

        // Demo users
        userRepository.save(User.builder()
            .name("John Reader")
            .email("john@example.com")
            .password(passwordEncoder.encode("user123"))
            .role(User.Role.ROLE_USER)
            .status(User.UserStatus.ACTIVE)
            .build());

        userRepository.save(User.builder()
            .name("Jane Smith")
            .email("jane@example.com")
            .password(passwordEncoder.encode("user123"))
            .role(User.Role.ROLE_USER)
            .status(User.UserStatus.ACTIVE)
            .build());

        log.info("Users seeded: admin@library.com / admin123, john@example.com / user123");
    }

    private List<Category> seedCategories() {
        List<Category> categories = List.of(
            Category.builder().name("Programming").description("Software development and coding books").icon("💻").build(),
            Category.builder().name("Technology").description("Technology and IT books").icon("🔧").build(),
            Category.builder().name("Science").description("Scientific concepts and discoveries").icon("🔬").build(),
            Category.builder().name("Fiction").description("Novels and story books").icon("📖").build(),
            Category.builder().name("Business").description("Business strategy and entrepreneurship").icon("💼").build(),
            Category.builder().name("Self Development").description("Personal growth and motivation").icon("🌱").build(),
            Category.builder().name("Education").description("Academic and educational material").icon("🎓").build(),
            Category.builder().name("History").description("Historical events and biographies").icon("🏛️").build(),
            Category.builder().name("Mystery").description("Thriller and mystery novels").icon("🕵️").build(),
            Category.builder().name("Romance").description("Love stories and romantic novels").icon("❤️").build()
        );
        return categoryRepository.saveAll(categories);
    }

    private void seedBooks(List<Category> categories) {
        Category prog = findByName(categories, "Programming");
        Category tech = findByName(categories, "Technology");
        Category sci = findByName(categories, "Science");
        Category fiction = findByName(categories, "Fiction");
        Category biz = findByName(categories, "Business");
        Category selfDev = findByName(categories, "Self Development");
        Category edu = findByName(categories, "Education");
        Category history = findByName(categories, "History");
        Category mystery = findByName(categories, "Mystery");

        List<Book> books = List.of(
            // FREE Books
            Book.builder().title("Introduction to Python Programming").author("Dr. Sarah Johnson")
                .description("A comprehensive beginner's guide to Python programming. Covers variables, loops, functions, OOP and file handling with real-world examples.")
                .isbn("978-0-13-110362-7").publisher("Tech Press").publicationDate(LocalDate.of(2023, 1, 15))
                .language("English").pages(320).category(prog)
                .accessType(Book.AccessType.FREE).price(BigDecimal.ZERO)
                .tags("python,programming,beginner").averageRating(4.5).totalRatings(128).purchaseCount(0)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Web Development Fundamentals").author("Mark Thompson")
                .description("Master the basics of web development including HTML, CSS, and JavaScript. Perfect for complete beginners wanting to build modern websites.")
                .isbn("978-0-13-110362-8").publisher("WebDev Books").publicationDate(LocalDate.of(2023, 3, 20))
                .language("English").pages(280).category(tech)
                .accessType(Book.AccessType.FREE).price(BigDecimal.ZERO)
                .tags("html,css,javascript,web").averageRating(4.3).totalRatings(95).purchaseCount(0)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("The Cosmic Mystery").author("Neil Andrews")
                .description("An exploration of the universe's greatest mysteries. From black holes to dark matter, discover what scientists are still trying to unravel.")
                .isbn("978-0-13-110362-9").publisher("Science Press").publicationDate(LocalDate.of(2022, 6, 10))
                .language("English").pages(245).category(sci)
                .accessType(Book.AccessType.FREE).price(BigDecimal.ZERO)
                .tags("space,science,astronomy").averageRating(4.7).totalRatings(203).purchaseCount(0)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Data Structures Explained").author("Prof. Alice Chen")
                .description("A clear, visual explanation of essential data structures including arrays, linked lists, trees, and graphs with implementation examples.")
                .isbn("978-0-13-110363-1").publisher("CS Education Press").publicationDate(LocalDate.of(2023, 2, 28))
                .language("English").pages(380).category(edu)
                .accessType(Book.AccessType.FREE).price(BigDecimal.ZERO)
                .tags("data structures,algorithms,cs").averageRating(4.6).totalRatings(167).purchaseCount(0)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("The Digital Revolution").author("James Carter")
                .description("How digital technology has transformed society, business, and human interaction over the past three decades.")
                .isbn("978-0-13-110363-2").publisher("Future Press").publicationDate(LocalDate.of(2022, 11, 5))
                .language("English").pages(295).category(history)
                .accessType(Book.AccessType.FREE).price(BigDecimal.ZERO)
                .tags("technology,history,digital").averageRating(4.2).totalRatings(78).purchaseCount(0)
                .status(Book.BookStatus.ACTIVE).build(),

            // PAID Books
            Book.builder().title("Java Programming: Complete Guide").author("Robert Martin")
                .description("Master Java from basics to advanced topics including Spring Boot, microservices, and cloud deployment. The most comprehensive Java resource available.")
                .isbn("978-0-13-110363-3").publisher("Code Masters").publicationDate(LocalDate.of(2023, 5, 10))
                .language("English").pages(650).category(prog)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("149"))
                .tags("java,spring,microservices,backend").averageRating(4.8).totalRatings(342).purchaseCount(89)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("React & Node.js Full Stack").author("Emily Rodriguez")
                .description("Build complete full-stack applications with React frontend and Node.js backend. Includes authentication, databases, and deployment strategies.")
                .isbn("978-0-13-110363-4").publisher("Dev Books").publicationDate(LocalDate.of(2023, 7, 22))
                .language("English").pages(480).category(prog)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("199"))
                .tags("react,nodejs,fullstack,javascript").averageRating(4.6).totalRatings(218).purchaseCount(156)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Machine Learning Mastery").author("Dr. Priya Sharma")
                .description("From linear regression to deep neural networks. Comprehensive ML coverage with Python, TensorFlow and real-world projects.")
                .isbn("978-0-13-110363-5").publisher("AI Press").publicationDate(LocalDate.of(2023, 4, 15))
                .language("English").pages(520).category(tech)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("249"))
                .tags("machine learning,python,tensorflow,ai").averageRating(4.9).totalRatings(456).purchaseCount(234)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("The Startup Blueprint").author("Michael Chang")
                .description("A step-by-step guide to building and scaling a successful startup. From idea validation to Series A funding.")
                .isbn("978-0-13-110363-6").publisher("Entrepreneur Press").publicationDate(LocalDate.of(2022, 9, 30))
                .language("English").pages(310).category(biz)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("99"))
                .tags("startup,entrepreneurship,business,funding").averageRating(4.4).totalRatings(189).purchaseCount(123)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Atomic Habits").author("James Clear")
                .description("Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones through a framework of small improvements.")
                .isbn("978-0-13-110363-7").publisher("Avery").publicationDate(LocalDate.of(2023, 1, 1))
                .language("English").pages(320).category(selfDev)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("149"))
                .tags("habits,productivity,self-help,mindset").averageRating(4.9).totalRatings(892).purchaseCount(445)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Cloud Architecture Patterns").author("Sam Wilson")
                .description("Design, build and operate cloud-native applications on AWS, Azure and GCP. Includes serverless, containers, and DevOps practices.")
                .isbn("978-0-13-110363-8").publisher("Cloud Books").publicationDate(LocalDate.of(2023, 6, 5))
                .language("English").pages(420).category(tech)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("199"))
                .tags("cloud,aws,azure,devops,kubernetes").averageRating(4.7).totalRatings(267).purchaseCount(178)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("The Shadow Game").author("Lisa Park")
                .description("A gripping mystery thriller set in the corporate world of Silicon Valley. When secrets collide, the stakes couldn't be higher.")
                .isbn("978-0-13-110363-9").publisher("Mystery House").publicationDate(LocalDate.of(2022, 8, 18))
                .language("English").pages(380).category(mystery)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("99"))
                .tags("mystery,thriller,fiction,suspense").averageRating(4.3).totalRatings(134).purchaseCount(67)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Database Design & SQL Mastery").author("Dr. Kevin Brown")
                .description("Master relational database design, normalization, complex SQL queries, performance tuning, and NoSQL concepts for modern applications.")
                .isbn("978-0-13-110364-1").publisher("DB Press").publicationDate(LocalDate.of(2023, 3, 12))
                .language("English").pages(450).category(prog)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("149"))
                .tags("sql,database,mysql,postgresql,nosql").averageRating(4.5).totalRatings(198).purchaseCount(112)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("The Art of War in Business").author("Sun Tzu (Modern Edition)")
                .description("Timeless strategic principles from Sun Tzu applied to modern business competition, leadership, and market dominance.")
                .isbn("978-0-13-110364-2").publisher("Strategy Books").publicationDate(LocalDate.of(2022, 12, 1))
                .language("English").pages(220).category(biz)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("49"))
                .tags("strategy,business,leadership,competition").averageRating(4.1).totalRatings(89).purchaseCount(45)
                .status(Book.BookStatus.ACTIVE).build(),

            Book.builder().title("Deep Work & Focus").author("Cal Newport")
                .description("Rules for focused success in a distracted world. Learn to perform deep work and achieve extraordinary results in less time.")
                .isbn("978-0-13-110364-3").publisher("Grand Central").publicationDate(LocalDate.of(2023, 2, 14))
                .language("English").pages(296).category(selfDev)
                .accessType(Book.AccessType.PAID).price(new BigDecimal("99"))
                .tags("productivity,focus,deep work,success").averageRating(4.8).totalRatings(523).purchaseCount(289)
                .status(Book.BookStatus.ACTIVE).build()
        );

        bookRepository.saveAll(books);
        log.info("Seeded {} books", books.size());
    }

    private Category findByName(List<Category> categories, String name) {
        return categories.stream()
            .filter(c -> c.getName().equals(name))
            .findFirst()
            .orElse(categories.get(0));
    }
}
