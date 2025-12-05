import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Modal, View, ScrollView } from 'react-native';

const GameRulesButton = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View>
            {/* Кнопка, що відкриває модальне вікно */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>❓ Правила Кобза</Text>
            </TouchableOpacity>

            {/* Модальне вікно з правилами */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Правила Гри "Кобза"</Text>
                        
                        <ScrollView style={{ maxHeight: 300 }}>
                            <Text style={styles.modalText}>
                                "Кобза" — це українська версія гри в слова Wordle. Ваша мета — вгадати слово з 5 літер за 6 спроб, використовуючи лише кольорові підказки. У грі немає фіксованої теми, тож слово може бути будь-яким іменником, прикметником чи іншою частиною мови української мови.
                            </Text>
                            <Text style={styles.modalSubtitle}>Як грати:</Text>
                            <Text style={styles.modalText}>
                                1. Введіть слово з 5 літер української абетки у спеціальне поле та натисніть "ENTER" (або еквівалентну кнопку у грі).
                            </Text>
                            <Text style={styles.modalText}>
                                2. Після підтвердження кожної спроби літери у вашому слові будуть підсвічені кольорами, які вказують, наскільки близьким є ваше припущення.
                            </Text>
                            <Text style={styles.modalText}>
                                3. Аналізуйте кольорові підказки, щоб обрати наступне слово. У вас є 6 спроб, щоб вгадати правильне слово.
                            </Text>
                            <Text style={styles.modalText}>
                                4. Гра закінчується, коли ви вгадуєте слово (всі літери зелені) або використовуєте всі 6 спроб без правильної відповіді.
                            </Text>
                            <Text style={styles.modalSubtitle}>Важливо про слова:</Text>
                            <Text style={styles.modalText}>
                                • Загадане слово не прив’язане до певної теми (наприклад, їжа, тварини чи природа). Це може бути будь-яке слово з 5 літер, яке існує в українській мові.
                            </Text>
                            <Text style={styles.modalText}>
                                • Ви не отримаєте підказок про зміст слова до початку гри. Покладайтеся лише на кольорові підказки після кожної спроби.
                            </Text>
                            <Text style={styles.modalSubtitle}>Кольорові підказки:</Text>
                            <Text style={styles.modalText}>
                                • 🟢 (Зелений) — Літера є в загаданому слові і стоїть на правильному місці.
                            </Text>
                            <Text style={styles.modalText}>
                                • 🟡 (Жовтий) — Літера є в загаданому слові, але стоїть не на тому місці.
                            </Text>
                            <Text style={styles.modalText}>
                                • ⚫️ (Чорний) — Літери немає в загаданому слові.
                            </Text>
                            <Text style={styles.modalSubtitle}>Приклад:</Text>
                            <Text style={styles.modalText}>
                                Загадане слово: **СЛОВО**. Ви вводите **СТІНА**:
                            </Text>
                            <Text style={styles.modalText}>
                                • С — 🟢 (правильна літера на правильному місці)
                            </Text>
                            <Text style={styles.modalText}>
                                • Т — ⚫️ (літери немає в слові)
                            </Text>
                            <Text style={styles.modalText}>
                                • І — ⚫️ (літери немає в слові)
                            </Text>
                            <Text style={styles.modalText}>
                                • Н — ⚫️ (літери немає в слові)
                            </Text>
                            <Text style={styles.modalText}>
                                • А — ⚫️ (літери немає в слові)
                            </Text>
                            <Text style={styles.modalText}>
                                На основі підказок ви знаєте, що "С" є на першій позиції. Спробуйте інше слово, наприклад, **СОФІЯ**, щоб отримати більше підказок.
                            </Text>
                            <Text style={styles.modalSubtitle}>Поради для гравців:</Text>
                            <Text style={styles.modalText}>
                                • Оскільки немає теми, починайте з універсальних слів, які містять поширені літери (наприклад, А, О, С, Н), щоб швидше отримати підказки.
                            </Text>
                            <Text style={styles.modalText}>
                                • Звертайте увагу на жовті літери — вони є в слові, але їх потрібно перемістити на іншу позицію.
                            </Text>
                            <Text style={styles.modalText}>
                                • Чорні літери виключайте з наступних спроб, щоб звузити вибір.
                            </Text>
                            <Text style={styles.modalText}>
                                • Не намагайтеся вгадати тему — слова обираються випадково, тож експериментуйте з різними комбінаціями.
                            </Text>
                            <Text style={styles.modalText}>
                                • Якщо ви вгадали слово, вітаємо! Якщо ні — спробуйте ще раз із новим словом!
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Закрити</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#0ea5e9',
        paddingVertical: 6,        // було 8
        paddingHorizontal: 12,     // було 15
        borderRadius: 8,           // було 10
        marginVertical: 5,         // було 10 → компактніше
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,              // трохи зменшив
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 16,          // трохи менше
        padding: 20,               // було 35 → компактніше
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: {
        marginBottom: 10,          // було 15
        textAlign: 'center',
        fontSize: 22,              // трохи менше
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    modalSubtitle: {
        marginTop: 8,              // було 10
        marginBottom: 4,           // було 5
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    modalText: {
        marginBottom: 3,           // було 5 → дуже компактно
        textAlign: 'left',
        fontSize: 15,              // трохи менше
        lineHeight: 20,            // було 22
        color: '#475569',
    },
    buttonClose: {
        backgroundColor: '#f43f5e',
        marginTop: 12,             // було 20 → ближче до тексту
    }
});

export default GameRulesButton;