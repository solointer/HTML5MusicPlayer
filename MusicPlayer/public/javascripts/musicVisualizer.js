function MusicVisualizer (obj) {
	this.source=null;
	this.count=0;
	this.analyser=MusicVisualizer.ac.createAnalyser();
	this.size=obj.size;
	this.analyser.fftsize=this.size*2;
	this.gainNode
}
MusicVisualizer.ac=