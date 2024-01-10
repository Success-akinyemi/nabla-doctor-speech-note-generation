
const quantumSize = 128;

const quantaPerPacket = 24; // (1/32 kHz) * 128 * 24 = 96 ms

export class RawPCM16Processor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.accumulatedQuantaCount = 0;
        this.paquet = new Int16Array(quantumSize * quantaPerPacket);
    }


    process(inputs, outputs, parameters) {
        const offset = quantumSize * this.accumulatedQuantaCount;
        const channels = inputs[0];
        if (channels.length > 0) {
            channels[0].forEach(
                (sample, idx) =>
                    (this.paquet[offset + idx] = Math.floor(sample * 0x7fff)),
            );
            this.accumulatedQuantaCount = this.accumulatedQuantaCount + 1;
            if (this.accumulatedQuantaCount === quantaPerPacket) {
                this.port.postMessage(this.paquet);
                this.accumulatedQuantaCount = 0;
            }
        }
        return true;
    }
}

registerProcessor("raw-pcm-16-worker", RawPCM16Processor);