package com.blossomcare.hospital.model;

import java.util.Objects;

/**
 * Encapsulated value object representing a patient's bedside physiological vital signs.
 * Mirrors the {@code vitals} structure in the Blossom Care TypeScript domain model:
 * {@code heartRate}, {@code spo2}, {@code bloodPressure}, and {@code temp}.
 */
public final class VitalSigns {

    private final int heartRateBpm;
    private final int spo2Percent;
    private final String bloodPressureMmHg;
    private final double temperatureCelsius;

    public VitalSigns(int heartRateBpm, int spo2Percent, String bloodPressureMmHg, double temperatureCelsius) {
        if (heartRateBpm < 20 || heartRateBpm > 300) {
            throw new IllegalArgumentException("Heart rate must be between 20 and 300 BPM. Provided: " + heartRateBpm);
        }
        if (spo2Percent < 40 || spo2Percent > 100) {
            throw new IllegalArgumentException("SpO2 percentage must be between 40% and 100%. Provided: " + spo2Percent);
        }
        if (bloodPressureMmHg == null || !bloodPressureMmHg.trim().matches("\\d{2,3}/\\d{2,3}")) {
            throw new IllegalArgumentException("Blood pressure must follow 'systolic/diastolic' format (e.g., 120/80).");
        }
        if (temperatureCelsius < 30.0 || temperatureCelsius > 44.0) {
            throw new IllegalArgumentException("Body temperature must be between 30.0°C and 44.0°C.");
        }
        this.heartRateBpm = heartRateBpm;
        this.spo2Percent = spo2Percent;
        this.bloodPressureMmHg = bloodPressureMmHg.trim();
        this.temperatureCelsius = temperatureCelsius;
    }

    public static VitalSigns defaultStableVitals() {
        return new VitalSigns(76, 98, "120/78", 36.8);
    }

    public int getHeartRateBpm() {
        return heartRateBpm;
    }

    public int getSpo2Percent() {
        return spo2Percent;
    }

    public String getBloodPressureMmHg() {
        return bloodPressureMmHg;
    }

    public double getTemperatureCelsius() {
        return temperatureCelsius;
    }

    /**
     * Checks whether any vital sign indicates acute physiological distress
     * (hypoxemia SpO2 < 92%, severe tachycardia > 120 BPM, or high fever >= 38.8°C).
     */
    public boolean indicatesAcuteDistress() {
        return spo2Percent < 92 || heartRateBpm > 120 || temperatureCelsius >= 38.8;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VitalSigns that)) return false;
        return heartRateBpm == that.heartRateBpm
                && spo2Percent == that.spo2Percent
                && Double.compare(that.temperatureCelsius, temperatureCelsius) == 0
                && Objects.equals(bloodPressureMmHg, that.bloodPressureMmHg);
    }

    @Override
    public int hashCode() {
        return Objects.hash(heartRateBpm, spo2Percent, bloodPressureMmHg, temperatureCelsius);
    }

    @Override
    public String toString() {
        return String.format("HR: %d bpm | SpO2: %d%% | BP: %s mmHg | Temp: %.1f°C",
                heartRateBpm, spo2Percent, bloodPressureMmHg, temperatureCelsius);
    }
}
